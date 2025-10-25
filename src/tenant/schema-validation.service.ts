import { Injectable, Logger } from '@nestjs/common';
import { AuthAdapterService } from '../auth-adapter/auth-adapter.service';
import Ajv, { ErrorObject, ValidateFunction } from 'ajv';

interface CacheEntry {
  validator: ValidateFunction;
  expiresAt: number;
}

interface ValidationResult {
  valid: boolean;
  errors?: string[];
}

@Injectable()
export class SchemaValidationService {
  private readonly logger = new Logger(SchemaValidationService.name);
  private readonly ajv: Ajv;
  private readonly cache: Map<string, CacheEntry>;
  private readonly CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes
  private readonly PERMISSIVE_SCHEMA = {
    type: 'object',
    additionalProperties: true,
  };

  constructor(private readonly authAdapter: AuthAdapterService) {
    this.ajv = new Ajv({ allErrors: true });
    this.cache = new Map<string, CacheEntry>();
  }

  /**
   * Validate the extra field against tenant-specific schema
   * @param tenantId - Tenant identifier
   * @param extra - The extra field data to validate
   * @param jwtToken - JWT token for authorization
   * @param requestId - Optional request ID for tracing
   * @returns Validation result with errors if invalid
   */
  async validateJobExtra(
    tenantId: string,
    extra: Record<string, unknown> | undefined,
    jwtToken: string,
    requestId?: string,
  ): Promise<ValidationResult> {
    // If extra is undefined or null, it's valid (optional field)
    if (!extra) {
      return { valid: true };
    }

    // Get the validator for this tenant (from cache or API)
    const validator = await this.getValidator(tenantId, jwtToken, requestId);

    // Validate the data
    const valid = validator(extra);

    if (valid) {
      return { valid: true };
    }

    // Format AJV errors into readable messages
    const errors = this.formatValidationErrors(validator.errors);
    return { valid: false, errors };
  }

  /**
   * Get or create a cached validator for a tenant
   */
  private async getValidator(
    tenantId: string,
    jwtToken: string,
    requestId?: string,
  ): Promise<ValidateFunction> {
    // Check cache first
    const cached = this.cache.get(tenantId);
    if (cached && cached.expiresAt > Date.now()) {
      return cached.validator;
    }

    // Fetch schema from auth-service API
    const schema = await this.fetchSchema(tenantId, jwtToken, requestId);

    // Compile schema with AJV
    const validator = this.ajv.compile(schema);

    // Cache the validator
    this.cache.set(tenantId, {
      validator,
      expiresAt: Date.now() + this.CACHE_TTL_MS,
    });

    return validator;
  }

  /**
   * Fetch job_fields_schema from user-auth-service API
   */
  private async fetchSchema(
    tenantId: string,
    jwtToken: string,
    requestId?: string,
  ): Promise<Record<string, unknown>> {
    try {
      const settings = await this.authAdapter.getTenantSettings(
        tenantId,
        jwtToken,
        requestId,
      );

      // Extract job_fields_schema from config
      const jobFieldsSchema = settings.config?.job_fields_schema;

      // If no schema defined, use permissive schema
      if (!jobFieldsSchema || typeof jobFieldsSchema !== 'object') {
        return this.PERMISSIVE_SCHEMA;
      }

      return jobFieldsSchema;
    } catch (error: unknown) {
      // On error, fall back to permissive schema
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(
        `Failed to fetch schema for tenant ${tenantId}: ${errorMessage}`,
      );
      return this.PERMISSIVE_SCHEMA;
    }
  }

  /**
   * Format AJV validation errors into readable messages
   */
  private formatValidationErrors(
    errors: ErrorObject[] | null | undefined,
  ): string[] {
    if (!errors || errors.length === 0) {
      return ['Validation failed'];
    }

    return errors.map((error) => {
      const field = error.instancePath || 'extra';
      const message = error.message || 'validation failed';

      // Handle different error types
      switch (error.keyword) {
        case 'required':
          return `${field}: missing required property '${error.params.missingProperty}'`;
        case 'type':
          return `${field}: must be ${error.params.type}`;
        case 'enum':
          return `${field}: must be one of ${JSON.stringify(error.params.allowedValues)}`;
        case 'additionalProperties':
          return `${field}: unexpected property '${error.params.additionalProperty}'`;
        default:
          return `${field}: ${message}`;
      }
    });
  }

  /**
   * Clear cache for a specific tenant (useful for testing or manual refresh)
   */
  clearCache(tenantId?: string): void {
    if (tenantId) {
      this.cache.delete(tenantId);
    } else {
      this.cache.clear();
    }
  }
}
