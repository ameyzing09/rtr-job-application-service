import { Module } from '@nestjs/common';
import { JobService } from './job.service';
import { JobController } from './job.controller';
import { PublicJobController } from './public-job.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Job } from './job.entity';
import { TenantModule } from '../tenant/tenant.module';

@Module({
  imports: [TypeOrmModule.forFeature([Job]), TenantModule],
  providers: [JobService],
  controllers: [JobController, PublicJobController],
})
export class JobModule {}
