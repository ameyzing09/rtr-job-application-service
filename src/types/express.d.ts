import { Request } from 'express';

declare global {
  namespace Express {
    interface Request {
      tenantId?: string;
      user?: {
        tenantId?: string;
        tid?: string;
        role?: string;
        roles?: string[];
        [key: string]: unknown;
      };
    }
  }
}
