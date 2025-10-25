import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { randomUUID } from 'crypto';

/**
 * Middleware to generate and attach a unique request ID to each request
 * for distributed tracing and logging
 */
@Injectable()
export class RequestIdMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction): void {
    // Use existing X-Request-Id if present, otherwise generate new UUID
    const requestId = (req.headers['x-request-id'] as string) || randomUUID();

    // Attach to request object for downstream use
    req['requestId'] = requestId;

    // Set response header for client tracking
    res.setHeader('X-Request-Id', requestId);

    next();
  }
}
