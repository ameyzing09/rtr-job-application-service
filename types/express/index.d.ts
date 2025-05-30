import 'express-serve-static-core'

declare module 'express-serve-static-core' {
    interface Request {
        tenantId?: string; // Optional tenantId for multi-tenant applications
    }
}