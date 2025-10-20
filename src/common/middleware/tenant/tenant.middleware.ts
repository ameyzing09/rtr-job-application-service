import {
  Injectable,
  NestMiddleware,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { ConfigService } from '@nestjs/config';
import * as jwt from 'jsonwebtoken';

interface JwtPayload {
  tenantId?: string;
  tid?: string;
  role?: string;
  roles?: string[];
  [key: string]: unknown;
}

@Injectable()
export class TenantMiddleware implements NestMiddleware {
  constructor(private readonly configService: ConfigService) {}

  use(req: Request, res: Response, next: NextFunction) {
    try {
      // Extract tenant ID from header
      const tenantIdFromHeader = req.headers['x-tenant-id'] as string;
      if (!tenantIdFromHeader) {
        throw new UnauthorizedException('Missing x-tenant-id header');
      }

      // Extract JWT token from Authorization header
      const authHeader = req.headers['authorization'] as string;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw new UnauthorizedException(
          'Missing or invalid Authorization header',
        );
      }

      const token = authHeader.substring(7); // Remove 'Bearer ' prefix

      // Get JWT secret (you may want to fetch tenant-specific secret)
      const jwtSecret = this.configService.get<string>('JWT_SECRET');
      if (!jwtSecret) {
        res.status(500).json({ message: 'JWT secret is not configured' });
        return;
      }

      // Verify and decode token
      const decoded = jwt.verify(token, jwtSecret) as JwtPayload;

      // Extract tenantId from token payload
      const tenantIdFromToken = decoded.tenantId || decoded.tid;
      if (!tenantIdFromToken) {
        throw new UnauthorizedException(
          'Token does not contain tenantId or tid',
        );
      }

      // Verify that token's tenantId matches header's tenantId
      // This is a critical security check: JWT.tid MUST equal X-Tenant-Id
      // Never trust the header alone - always validate against the JWT
      if (tenantIdFromToken !== tenantIdFromHeader) {
        throw new ForbiddenException(
          'Access denied: Tenant ID in JWT does not match X-Tenant-Id header',
        );
      }

      // Attach tenantId to request for downstream use
      req['tenantId'] = tenantIdFromHeader;
      req['user'] = decoded; // Optionally attach decoded token payload

      next();
    } catch (error) {
      if (error instanceof ForbiddenException) {
        // 403: Valid authentication but attempting to access wrong tenant
        res.status(403).json({
          statusCode: 403,
          message: error.message,
          error: 'Forbidden',
        });
      } else if (error instanceof UnauthorizedException) {
        // 401: Authentication failure (missing/invalid credentials)
        res.status(401).json({
          statusCode: 401,
          message: error.message,
          error: 'Unauthorized',
        });
      } else if (error instanceof jwt.TokenExpiredError) {
        // 401: Token is valid but expired
        res.status(401).json({
          statusCode: 401,
          message: 'Token expired',
          error: 'Unauthorized',
        });
      } else if (error instanceof jwt.JsonWebTokenError) {
        // 401: Token is malformed or signature invalid
        res.status(401).json({
          statusCode: 401,
          message: 'Invalid token',
          error: 'Unauthorized',
        });
      } else {
        // 500: Unexpected server error
        res.status(500).json({
          statusCode: 500,
          message: 'Internal server error',
          error: 'Internal Server Error',
        });
      }
    }
  }
}
