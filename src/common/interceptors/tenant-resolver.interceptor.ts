import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { TenantService } from '../../tenant/tenant.service';
import { extractSubdomain } from '../utils/subdomain.util';

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
    const request = context.switchToHttp().getRequest();

    // Extract subdomain from host header
    const host = request.headers.host;
    if (!host) {
      throw new BadRequestException('Host header is missing');
    }

    const subdomain = extractSubdomain(host);
    if (!subdomain) {
      throw new BadRequestException('Subdomain required in host header');
    }

    // Look up tenant by slug
    const tenant = await this.tenantService.findBySlug(subdomain);
    if (!tenant) {
      throw new NotFoundException('Tenant not found');
    }

    // Attach tenant to request for downstream use
    request['tenantId'] = tenant.id;
    request['tenant'] = tenant;

    return next.handle();
  }
}
