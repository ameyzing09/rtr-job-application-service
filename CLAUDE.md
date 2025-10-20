# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

NestJS-based microservice for managing job postings and candidate applications in a multi-tenant architecture. Uses TypeORM with MySQL for data persistence and migrations.

## Development Commands

### Running the Application
```bash
npm run start:dev          # Development with watch mode
npm run start:debug        # Development with debugging enabled
npm run build              # Production build
npm run start:prod         # Run production build
```

### Testing
```bash
npm test                   # Run unit tests
npm run test:watch         # Run tests in watch mode
npm run test:e2e           # Run end-to-end tests
npm run test:cov           # Run tests with coverage
npm run test:debug         # Run tests with debugging
```

### Code Quality
```bash
npm run lint               # Lint and auto-fix TypeScript files
npm run format             # Format code with Prettier
```

### Database Migrations

Migrations are managed through TypeORM CLI and configured in `src/database/data-source.ts`:

```bash
# Generate migration from entity changes
npm run typeorm -- migration:generate ./src/migrations/MigrationName -d ./src/database/data-source.ts

# Run pending migrations
npm run migration:run

# Revert last migration
npm run migration:revert
```

**Important**: Migrations must be run in all environments (local, CI, production) to keep schemas synchronized. The `synchronize: false` setting in data-source.ts means schema changes only occur via migrations.

## Architecture

### Multi-Tenant Design

All requests MUST include both:
1. **`x-tenant-id` header**: Identifies the tenant
2. **`Authorization` header**: Bearer JWT token for authentication

The `TenantMiddleware` (applied globally to all routes in `app.module.ts`):
- Validates both headers are present
- Verifies JWT token using `JWT_SECRET` from environment
- Extracts `tenantId` (or `tid`) from token payload
- Verifies token's tenantId matches the `x-tenant-id` header
- Attaches `tenantId` to request object for downstream use
- Returns 401 Unauthorized on any validation failure

**Critical**:
- When adding new entities or services, ensure all queries filter by `tenantId` to maintain tenant isolation
- All API requests require valid JWT token with matching tenantId

### Module Structure

- **JobModule**: Manages job postings (CRUD operations)
- **ApplicationsModule**: Manages candidate applications (CRUD operations)
- **DatabaseModule**: TypeORM configuration and setup

### Entity Relationships

```
Job (1) ---> (*) Application
- Jobs have many Applications
- Applications belong to one Job
- Cascade delete: deleting a Job removes all its Applications
```

Both entities include:
- `tenantId` for multi-tenant isolation
- UUID primary keys
- Indexed fields for query performance (see `@Index` decorators)
- Timestamps (`created_at`, `updated_at`)

### Data Access Patterns

Services use TypeORM Repository pattern:
1. All queries include `tenantId` in the WHERE clause
2. Methods accept `tenantId` as the first parameter
3. `getBy*` methods throw `NotFoundException` when records don't exist
4. Updates use `Object.assign()` followed by `save()`

### Custom Fields (Job.extra)

Jobs support tenant-specific custom fields via the `extra` JSON column:
- **Type**: `Record<string, unknown>` (not `any` - maintains type safety)
- **Storage**: Flexible JSON field stores arbitrary tenant-defined data
- **No Validation**: Accepts any valid JSON without schema validation
- **Flexibility**: Allows each tenant to define their own custom fields
- **Database**: Stored as JSON type in MySQL, nullable column

## Configuration

Environment variables required in `.env`:

### Database
```
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=recrutr-db
```

### Authentication
```
JWT_SECRET=your-secret-key    # Secret key for JWT token verification
```

The `data-source.ts` configuration is used by both:
- NestJS application runtime (via DatabaseModule)
- TypeORM CLI for migrations

## TypeScript Guidelines

### Strict Type Safety

**CRITICAL: Do NOT use `any` type**
- Always use proper TypeScript types or interfaces
- Use `unknown` for truly unknown types, then narrow with type guards
- Use generics (`<T>`) for reusable type-safe functions
- Define DTOs and interfaces for all data structures
- Avoid type assertions (`as any`) unless absolutely necessary

**Acceptable alternatives to `any`:**
- `Record<string, unknown>` for objects with unknown structure
- `unknown` with type guards for runtime type checking
- Proper interface/type definitions
- Generics for flexible but type-safe code

**Example violations to avoid:**
```typescript
// ❌ BAD
function process(data: any) { ... }
const result = decoded as any;

// ✅ GOOD
interface ProcessData { id: string; name: string; }
function process(data: ProcessData) { ... }
const result = decoded as JwtPayload;
```

## Testing Conventions

- Unit tests: `*.spec.ts` files alongside source files
- E2E tests: `test/*.e2e-spec.ts`
- Jest configured with ts-jest transformer
- Tests run from `src/` as root directory
