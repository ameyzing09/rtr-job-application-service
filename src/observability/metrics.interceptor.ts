import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { InjectMetric } from '@willsoto/nestjs-prometheus';
import { Counter, Histogram } from 'prom-client';

/**
 * Interceptor to track HTTP metrics for observability
 */
@Injectable()
export class MetricsInterceptor implements NestInterceptor {
  constructor(
    @InjectMetric('http_requests_total')
    private readonly requestCounter: Counter,
    @InjectMetric('http_request_duration_seconds')
    private readonly requestDuration: Histogram,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<{
      method: string;
      route?: { path: string };
      url: string;
      tenantId?: string;
    }>();
    const response = context.switchToHttp().getResponse<{
      statusCode: number;
    }>();

    const startTime = Date.now();
    const method = request.method;
    const route = request.route?.path || request.url;

    return next.handle().pipe(
      tap({
        next: () => {
          this.recordMetrics(
            method,
            route,
            response.statusCode,
            request.tenantId || 'unknown',
            startTime,
          );
        },
        error: (error: unknown) => {
          const statusCode = this.getStatusCode(error);
          this.recordMetrics(
            method,
            route,
            statusCode,
            request.tenantId || 'unknown',
            startTime,
          );
        },
      }),
    );
  }

  private recordMetrics(
    method: string,
    route: string,
    statusCode: number,
    tenantId: string,
    startTime: number,
  ): void {
    const duration = (Date.now() - startTime) / 1000; // Convert to seconds

    // Increment request counter
    this.requestCounter.inc({
      method,
      route,
      status_code: statusCode.toString(),
      tenant_id: tenantId,
    });

    // Record request duration
    this.requestDuration.observe(
      {
        method,
        route,
        status_code: statusCode.toString(),
      },
      duration,
    );
  }

  /**
   * Extract status code from error
   */
  private getStatusCode(error: unknown): number {
    if (
      typeof error === 'object' &&
      error !== null &&
      'status' in error &&
      typeof (error as { status: unknown }).status === 'number'
    ) {
      return (error as { status: number }).status;
    }
    return 500;
  }
}
