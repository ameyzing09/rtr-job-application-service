import { Injectable, Logger } from '@nestjs/common';
import { ThrottlerGuard, ThrottlerException } from '@nestjs/throttler';
import { ExecutionContext } from '@nestjs/common';

/**
 * Custom throttler guard that tracks rate limits per IP + Tenant combination.
 * This prevents a single bad actor from affecting multiple tenants,
 * while still protecting individual tenants from abuse.
 */
@Injectable()
export class TenantThrottlerGuard extends ThrottlerGuard {
  private readonly logger = new Logger(TenantThrottlerGuard.name);

  protected generateKey(
    context: ExecutionContext,
    suffix: string,
    name: string,
  ): string {
    const request = context.switchToHttp().getRequest();

    // Extract IP address (handle proxies)
    const ip =
      request.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
      request.headers['x-real-ip'] ||
      request.connection?.remoteAddress ||
      request.socket?.remoteAddress ||
      'unknown';

    // Extract tenant ID (should be set by interceptor before guard runs)
    const tenantId = request['tenantId'] || 'no-tenant';

    // Combine IP + tenant for unique tracking key
    const key = `${ip}:${tenantId}:${name}:${suffix}`;

    return key;
  }

  protected async throwThrottlingException(
    context: ExecutionContext,
  ): Promise<void> {
    const request = context.switchToHttp().getRequest();
    const ip =
      request.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
      request.headers['x-real-ip'] ||
      request.connection?.remoteAddress ||
      'unknown';
    const tenantId = request['tenantId'] || 'no-tenant';

    // Log rate limit exceeded event
    this.logger.warn(
      `Rate limit exceeded - IP: ${ip}, Tenant: ${tenantId}, Path: ${request.url}`,
    );

    throw new ThrottlerException(
      'Too many application submissions. Please try again later.',
    );
  }
}
