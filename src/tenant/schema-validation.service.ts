import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TenantSettings } from './tenant-settings.entity';
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
  private readonly ajv: Ajv;
  private readonly cache: Map<string, CacheEntry>;
  private readonly CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes
  private readonly PERMISSIVE_SCHEMA = {
    type: 'object',
    additionalProperties: true,
  };

  constructor(
    @InjectRepository(TenantSettings)
    private tenantSettingsRepository: Repository<TenantSettings>,
  ) {
    this.ajv = new Ajv({ allErrors: true });
    this.cache = new Map<string, CacheEntry>();
  }

  /**
   * Validate the extra field against tenant-specific schema
   * @param tenantId - Tenant identifier
   * @param extra - The extra field data to validate
   * @returns Validation result with errors if invalid
   */
  async validateJobExtra(
    tenantId: string,
    extra: Record<string, unknown> | undefined,
  ): Promise<ValidationResult> {
    // If extra is undefined or null, it's valid (optional field)
    if (!extra) {
      return { valid: true };
    }

    // Get the validator for this tenant (from cache or DB)
    const validator = await this.getValidator(tenantId);

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
  private async getValidator(tenantId: string): Promise<ValidateFunction> {
    // Check cache first
    const cached = this.cache.get(tenantId);
    if (cached && cached.expiresAt > Date.now()) {
      return cached.validator;
    }

    // Fetch schema from database
    const schema = await this.fetchSchema(tenantId);

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
   * Fetch job_fields_schema from tenant_settings table
   */
  private async fetchSchema(
    tenantId: string,
  ): Promise<Record<string, unknown>> {
    try {
      const settings = await this.tenantSettingsRepository.findOne({
        where: { tenantId },
      });

      // If no settings found, use permissive schema
      if (!settings) {
        return this.PERMISSIVE_SCHEMA;
      }

      // Extract job_fields_schema from config
      const jobFieldsSchema = settings.config?.job_fields_schema;

      // If no schema defined, use permissive schema
      if (!jobFieldsSchema || typeof jobFieldsSchema !== 'object') {
        return this.PERMISSIVE_SCHEMA;
      }

      return jobFieldsSchema;
    } catch (error) {
      // On error, fall back to permissive schema
      console.error(`Failed to fetch schema for tenant ${tenantId}:`, error);
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
