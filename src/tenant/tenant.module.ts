import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Tenant } from './tenant.entity';
import { TenantSettings } from './tenant-settings.entity';
import { TenantService } from './tenant.service';
import { SchemaValidationService } from './schema-validation.service';

@Module({
  imports: [TypeOrmModule.forFeature([Tenant, TenantSettings])],
  providers: [TenantService, SchemaValidationService],
  exports: [TenantService, SchemaValidationService],
})
export class TenantModule {}
