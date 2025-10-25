import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { Request } from 'express';
import { TenantService } from '../../tenant/tenant.service';
import { TenantDto } from '../../auth-adapter/auth-adapter.dto';
import { extractSubdomain } from '../utils/subdomain.util';

interface RequestWithTenant extends Request {
  tenantId?: string;
  tenant?: TenantDto;
  requestId?: string;
}

/**
 * Interceptor that resolves tenant from subdomain and attaches to request.
 * This runs before guards, allowing the throttler guard to access tenantId.
 */
@Injectable()
export class TenantResolverInterceptor implements NestInterceptor {
  constructor(private readonly tenantService: TenantService) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<unknown>> {
    const request = context.switchToHttp().getRequest<RequestWithTenant>();

    // Extract subdomain from host header
    const host = request.headers.host;
    if (!host || typeof host !== 'string') {
      throw new BadRequestException('Host header is missing');
    }

    const subdomain = extractSubdomain(host);
    if (!subdomain) {
      throw new BadRequestException('Subdomain required in host header');
    }

    // Get request ID if available
    const requestId = request.requestId;

    // Look up tenant by slug (public endpoint - no JWT required)
    const tenant = await this.tenantService.findBySlug(
      subdomain,
      undefined,
      requestId,
    );
    if (!tenant) {
      throw new NotFoundException('Tenant not found');
    }

    // Attach tenant to request for downstream use
    request.tenantId = tenant.id;
    request.tenant = tenant;

    return next.handle();
  }
}
