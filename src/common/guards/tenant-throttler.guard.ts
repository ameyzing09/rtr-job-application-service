import { Injectable, Logger } from '@nestjs/common';
import { ThrottlerGuard, ThrottlerException } from '@nestjs/throttler';
import { ExecutionContext } from '@nestjs/common';
import { Request } from 'express';

interface RequestWithTenant extends Request {
  tenantId?: string;
}

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
    const request = context.switchToHttp().getRequest<RequestWithTenant>();

    // Extract IP address (handle proxies)
    const forwardedFor = request.headers['x-forwarded-for'];
    const xRealIp = request.headers['x-real-ip'];

    let ip = 'unknown';
    if (typeof forwardedFor === 'string') {
      ip = forwardedFor.split(',')[0]?.trim() || 'unknown';
    } else if (typeof xRealIp === 'string') {
      ip = xRealIp;
    } else if (request.socket?.remoteAddress) {
      ip = request.socket.remoteAddress;
    }

    // Extract tenant ID (should be set by interceptor before guard runs)
    const tenantId = request.tenantId || 'no-tenant';

    // Combine IP + tenant for unique tracking key
    const key = `${ip}:${tenantId}:${name}:${suffix}`;

    return key;
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  protected async throwThrottlingException(
    context: ExecutionContext,
  ): Promise<void> {
    const request = context.switchToHttp().getRequest<RequestWithTenant>();

    // Extract IP address (handle proxies)
    const forwardedFor = request.headers['x-forwarded-for'];
    const xRealIp = request.headers['x-real-ip'];

    let ip = 'unknown';
    if (typeof forwardedFor === 'string') {
      ip = forwardedFor.split(',')[0]?.trim() || 'unknown';
    } else if (typeof xRealIp === 'string') {
      ip = xRealIp;
    } else if (request.socket?.remoteAddress) {
      ip = request.socket.remoteAddress;
    }

    const tenantId = request.tenantId || 'no-tenant';

    // Log rate limit exceeded event
    this.logger.warn(
      `Rate limit exceeded - IP: ${ip}, Tenant: ${tenantId}, Path: ${request.url}`,
    );

    throw new ThrottlerException(
      'Too many application submissions. Please try again later.',
    );
  }
}
