import { Module } from '@nestjs/common';
import { ApplicationsService } from './applications.service';
import { ApplicationsController } from './applications.controller';
import { PublicApplicationsController } from './public-applications.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Application } from './applications.entity';
import { Job } from 'src/job/job.entity';
import { TenantModule } from '../tenant/tenant.module';
import { CaptchaModule } from '../captcha/captcha.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Application, Job]),
    TenantModule,
    CaptchaModule,
  ],
  providers: [ApplicationsService],
  controllers: [ApplicationsController, PublicApplicationsController],
})
export class ApplicationsModule {}
