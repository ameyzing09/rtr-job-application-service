import { Module } from '@nestjs/common';
import { JobService } from './job.service';
import { JobController } from './job.controller';
import { PublicJobController } from './public-job.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Job } from './job.entity';
import { TenantModule } from '../tenant/tenant.module';
import { ValidateJobExtraConstraint } from '../common/validators/job-extra.validator';

@Module({
  imports: [TypeOrmModule.forFeature([Job]), TenantModule],
  providers: [JobService, ValidateJobExtraConstraint],
  controllers: [JobController, PublicJobController],
})
export class JobModule {}
