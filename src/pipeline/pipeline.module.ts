import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { PipelineService } from './pipeline.service';

@Module({
  imports: [HttpModule, ConfigModule],
  providers: [PipelineService],
  exports: [PipelineService],
})
export class PipelineModule {}
