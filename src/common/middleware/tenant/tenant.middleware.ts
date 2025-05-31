import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class TenantMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const tenantId = req.headers['x-tenant-id'] as string;
    if (!tenantId) {
      res.status(400).json({ message: 'Missing x-tenant-id header' });
      return;
    }
    req['tenant_id'] = tenantId;
    next();
  }
}
