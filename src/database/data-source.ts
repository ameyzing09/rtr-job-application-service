import * as dotenv from 'dotenv';
import { DataSource } from 'typeorm';
import { Job } from '../job/job.entity';
import { Application } from '../applications/applications.entity';

dotenv.config();

/**
 * TypeORM Data Source Configuration
 *
 * ENTITY OWNERSHIP:
 * - Job, Application: ✅ OWNED by this service (safe for migrations)
 * - Tenant, TenantSettings: ⚠️ EXTERNAL (owned by rtr-user-auth-service)
 *   → Accessed via AuthAdapter HTTP API calls, NOT direct DB queries
 *
 * MIGRATION REVIEW PROCESS:
 * Before running any migration:
 * 1. Review generated migration file
 * 2. Ensure ONLY owned tables (jobs, applications) are modified
 * 3. Test rollback (down migration)
 *
 * See MIGRATION_CHECKLIST.md for detailed review process.
 */
export const AppDataSource = new DataSource({
  type: 'mysql',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  username: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'ameykode',
  database: process.env.DB_NAME || 'recrutr-db',
  // Only entities OWNED by this service
  entities: [Job, Application],
  migrations: ['dist/migrations/*.js', 'src/migrations/*.ts'],
  migrationsTableName: 'migrations',
  synchronize: false, // NEVER enable in production
});
