import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Req,
} from '@nestjs/common';
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

  @Get(':jobId')
  async getJob(@Param('jobId') jobId: string, @Req() req: Request) {
    const tenant_id = req['tenant_id'] as string;
    return this.jobService.getJobsById(tenant_id, jobId);
  }

  @Put(':jobId')
  async updateJob(
    @Param('jobId') jobId: string,
    @Body() updateJobPayload: CreateJobDto,
    @Req() req: Request,
  ) {
    const tenant_id = req['tenant_id'] as string;
    return this.jobService.updateJob(tenant_id, jobId, updateJobPayload);
  }

  @Delete(':jobId')
  async deleteJob(@Param('jobId') jobId: string, @Req() req: Request) {
    const tenant_id = req['tenant_id'] as string;
    return this.jobService.deleteJob(tenant_id, jobId);
  }
}
