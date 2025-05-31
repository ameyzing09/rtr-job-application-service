import { Body, Controller, Get, Post, Req } from '@nestjs/common';
import { JobService } from './job.service';
import { CreateJobDto } from './job.dto';

@Controller('job')
export class JobController {
  constructor(private readonly jobService: JobService) {}

  @Post()
  async createJob(@Body() createJobPayload: CreateJobDto, @Req() req: Request) {
    const tenant_id = req['tenant_id'] as string;
    return this.jobService.createJob(tenant_id, createJobPayload);
  }

  @Get()
  async getJobs(@Req() req: Request) {
    const tenant_id = req['tenant_id'] as string;
    return this.jobService.getJobs(tenant_id);
  }
}
