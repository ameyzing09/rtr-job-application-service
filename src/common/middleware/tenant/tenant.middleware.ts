import {
  Injectable,
  NestMiddleware,
  UnauthorizedException,
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
      if (tenantIdFromToken !== tenantIdFromHeader) {
        throw new UnauthorizedException(
          'Tenant ID mismatch between token and header',
        );
      }

      // Attach tenantId to request for downstream use
      req['tenantId'] = tenantIdFromHeader;
      req['user'] = decoded; // Optionally attach decoded token payload

      next();
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        res.status(401).json({ message: error.message });
      } else if (error instanceof jwt.TokenExpiredError) {
        res.status(401).json({ message: 'Token expired' });
      } else if (error instanceof jwt.JsonWebTokenError) {
        res.status(401).json({ message: 'Invalid token' });
      } else {
        res.status(500).json({ message: 'Internal server error' });
      }
    }
  }
}
