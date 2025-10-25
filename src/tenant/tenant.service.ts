import { Injectable } from '@nestjs/common';
import { AuthAdapterService } from '../auth-adapter/auth-adapter.service';
import { TenantDto } from '../auth-adapter/auth-adapter.dto';

/**
 * Service for tenant operations
 * Now uses AuthAdapter to call user-auth-service APIs instead of direct DB access
 */
@Injectable()
export class TenantService {
  constructor(private readonly authAdapter: AuthAdapterService) {}

  /**
   * Find tenant by slug (subdomain)
   * Calls user-auth-service public API
   *
   * @param slug Tenant slug
   * @param jwtToken Optional JWT token (for authenticated calls)
   * @param requestId Optional request ID for tracing
   * @returns Tenant information or null if not found
   */
  async findBySlug(
    slug: string,
    jwtToken?: string,
    requestId?: string,
  ): Promise<TenantDto | null> {
    try {
      return await this.authAdapter.getTenantBySlug(
        slug,
        jwtToken,
        undefined,
        requestId,
      );
    } catch (error: unknown) {
      // Return null if tenant not found (maintains backward compatibility)
      if (this.isNotFoundError(error)) {
        return null;
      }
      throw error;
    }
  }

  /**
   * Type guard to check if error is a 404 NotFoundException
   */
  private isNotFoundError(error: unknown): boolean {
    return (
      typeof error === 'object' &&
      error !== null &&
      'status' in error &&
      (error as { status: number }).status === 404
    );
  }
}
