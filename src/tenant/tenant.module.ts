import { Module } from '@nestjs/common';
import { TenantService } from './tenant.service';
import { SchemaValidationService } from './schema-validation.service';
import { AuthAdapterModule } from '../auth-adapter/auth-adapter.module';

/**
 * Tenant Module
 *
 * No longer manages tenant database tables directly.
 * Uses AuthAdapterModule to call user-auth-service APIs for tenant data.
 */
@Module({
  imports: [AuthAdapterModule],
  providers: [TenantService, SchemaValidationService],
  exports: [TenantService, SchemaValidationService],
})
export class TenantModule {}
