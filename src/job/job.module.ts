import { Module } from '@nestjs/common';
import { JobService } from './job.service';
import { JobController } from './job.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Job } from './job.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Job])],
  providers: [JobService],
  controllers: [JobController],
})
export class JobModule {}
