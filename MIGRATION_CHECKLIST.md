# Migration Review Checklist

This checklist ensures migrations only affect tables owned by this service and don't interfere with external tables managed by other microservices.

## Table Ownership

| Table | Owner | This Service Can |
|-------|-------|------------------|
| `jobs` | ✅ rtr-job-application-service | Create/Modify/Delete |
| `applications` | ✅ rtr-job-application-service | Create/Modify/Delete |
| `tenants` | ⚠️ rtr-user-auth-service (Go) | **API ACCESS ONLY** (via AuthAdapter) |
| `tenant_settings` | ⚠️ rtr-user-auth-service (Go) | **API ACCESS ONLY** (via AuthAdapter) |

## Before Running Any Migration

### Step 1: Generate Migration
```bash
npm run typeorm -- migration:generate ./src/migrations/MigrationName -d ./src/database/data-source.ts
```

### Step 2: Review Generated File ⚠️ CRITICAL

Open the generated migration file in `src/migrations/` and check:

#### ✅ ALLOWED Operations
- Any changes to `applications` table
- Any changes to `jobs` table
- Creating indexes on owned tables
- Modifying column types on owned tables

#### ❌ FORBIDDEN Operations - REMOVE IMMEDIATELY
- ANY changes to `tenants` table
- ANY changes to `tenant_settings` table

These tables are owned by user-auth-service and accessed via AuthAdapter HTTP API.
They are no longer in this service's TypeORM entities, so migrations should NOT touch them.

### Step 3: Clean Up Migration

If you find any `tenants` table operations:

1. **Remove them from the `up()` method**
2. **Remove them from the `down()` method**
3. **Add comments** explaining what was removed (optional, for clarity)

Example:
```typescript
public async up(queryRunner: QueryRunner): Promise<void> {
  // Removed: Tenant table changes (lines 7-31) - table owned by auth-service

  // ✅ Safe: Application table changes
  await queryRunner.query(`ALTER TABLE applications ADD ...`);
}
```

### Step 4: Verify Rollback

Ensure the `down()` method correctly reverses ONLY the owned table changes:
- Should drop/revert changes to `applications`, `jobs`, `tenant_settings`
- Should NOT touch `tenants` table

### Step 5: Build Project
```bash
npm run build
```

Check for TypeScript errors related to entity changes.

### Step 6: Run Migration (Development First!)
```bash
# Development database
npm run migration:run

# Verify tables
# Check that only owned tables were modified
```

### Step 7: Test Rollback
```bash
npm run migration:revert
```

Ensure the `down()` migration works correctly.

## Common Issues

### Issue: Migration includes tenant/tenant_settings table changes
**Cause:** Previous versions had these as TypeORM entities
**Solution:** These tables are now accessed via API only. If old migrations reference them, that's historical - new migrations should NOT touch them.

### Issue: Migration fails with "table doesn't exist"
**Cause:** Trying to modify a column/index that doesn't exist
**Solution:** Review the migration file, remove invalid operations

## Quick Reference Commands

```bash
# Generate migration
npm run typeorm -- migration:generate ./src/migrations/MigrationName -d ./src/database/data-source.ts

# Run migrations
npm run migration:run

# Revert last migration
npm run migration:revert

# Show migration status
npm run typeorm -- migration:show -d ./src/database/data-source.ts
```

## Need to Modify Tenants or TenantSettings Tables?

If you genuinely need to modify these tables:

1. **STOP** - Don't do it in this service
2. Contact the **rtr-user-auth-service** team
3. They own the tables and should create the migration in their service
4. Coordinate the deployment with them
5. This service accesses them via AuthAdapter API - no code changes needed here

## External Data Access

**Tenant data:** Accessed via `AuthAdapterService.getTenantBySlug()`
**Tenant settings:** Accessed via `AuthAdapterService.getTenantSettings()`

No direct database queries to these tables from this service.

---

**Remember:** When in doubt, only modify tables in the "Owned" column above! 🛡️
