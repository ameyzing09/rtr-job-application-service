import { Module } from '@nestjs/common';
import { StorageService } from './storage.service';
import { StorageController } from './storage.controller';
import { PublicUploadController } from './public-upload.controller';
import { TenantModule } from '../tenant/tenant.module';

@Module({
  imports: [TenantModule],
  providers: [StorageService],
  controllers: [StorageController, PublicUploadController],
  exports: [StorageService],
})
export class StorageModule {}
