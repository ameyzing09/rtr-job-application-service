import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { randomUUID } from 'crypto';
import { TenantDto, TenantSettingsDto } from './auth-adapter.dto';

/**
 * Adapter for communicating with user-auth-service
 * Handles tenant lookup and settings retrieval via HTTP API
 */
@Injectable()
export class AuthAdapterService {
  private readonly logger = new Logger(AuthAdapterService.name);
  private readonly authServiceUrl: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.authServiceUrl = this.configService.get<string>(
      'USER_AUTH_SERVICE_URL',
      '',
    );
  }

  /**
   * Get tenant by slug (subdomain)
   * PUBLIC endpoint - no authentication required
   *
   * @param slug Tenant slug (subdomain)
   * @param jwtToken Optional JWT token for authenticated calls
   * @param tenantId Optional tenant ID header
   * @param requestId Optional request ID for tracing
   * @returns Tenant information
   * @throws NotFoundException if tenant not found
   */
  async getTenantBySlug(
    slug: string,
    jwtToken?: string,
    tenantId?: string,
    requestId?: string,
  ): Promise<TenantDto> {
    try {
      const headers = this.buildHeaders(jwtToken, tenantId, requestId);

      const response = await firstValueFrom(
        this.httpService.get<TenantDto>(
          `${this.authServiceUrl}/internal/tenants/by-slug/${slug}`,
          { headers },
        ),
      );

      return response.data;
    } catch (error: unknown) {
      if (this.isAxiosError(error) && error.response?.status === 404) {
        this.logger.log(`Tenant not found for slug: ${slug}`);
        throw new NotFoundException('Tenant not found');
      }

      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(
        `Failed to get tenant by slug ${slug}: ${errorMessage}`,
      );
      throw error;
    }
  }

  /**
   * Get tenant settings
   *
   * @param tenantId Tenant UUID
   * @param jwtToken JWT token for authorization
   * @param requestId Optional request ID for tracing
   * @returns Tenant settings including configuration
   * @throws NotFoundException if tenant settings not found
   */
  async getTenantSettings(
    tenantId: string,
    jwtToken: string,
    requestId?: string,
  ): Promise<TenantSettingsDto> {
    try {
      const headers = this.buildHeaders(jwtToken, tenantId, requestId);

      const response = await firstValueFrom(
        this.httpService.get<TenantSettingsDto>(
          `${this.authServiceUrl}/internal/tenants/${tenantId}/settings`,
          { headers },
        ),
      );

      return response.data;
    } catch (error: unknown) {
      if (this.isAxiosError(error) && error.response?.status === 404) {
        this.logger.log(`Tenant settings not found for tenant: ${tenantId}`);
        throw new NotFoundException('Tenant settings not found');
      }

      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(
        `Failed to get tenant settings for ${tenantId}: ${errorMessage}`,
      );
      throw error;
    }
  }

  /**
   * Build standard headers for auth-service requests
   */
  private buildHeaders(
    jwtToken?: string,
    tenantId?: string,
    requestId?: string,
  ): Record<string, string> {
    const headers: Record<string, string> = {
      'X-Request-Id': requestId || randomUUID(),
    };

    if (jwtToken) {
      headers['Authorization'] = `Bearer ${jwtToken}`;
    }

    if (tenantId) {
      headers['X-Tenant-Id'] = tenantId;
    }

    return headers;
  }

  /**
   * Type guard to check if error is an Axios error
   */
  private isAxiosError(
    error: unknown,
  ): error is { response?: { status?: number } } {
    return typeof error === 'object' && error !== null && 'response' in error;
  }
}
