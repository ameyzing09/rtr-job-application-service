import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Req,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { JobService } from './job.service';
import { CreateJobDto, UpdateJobDto } from './job.dto';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@Controller('job')
@UseInterceptors(ClassSerializerInterceptor)
export class JobController {
  constructor(private readonly jobService: JobService) {}

  @Post()
  async createJob(@Body() createJobPayload: CreateJobDto, @Req() req: Request) {
    const tenantId = req['tenantId'] as string;
    return this.jobService.createJob(tenantId, createJobPayload);
  }

  @Get()
  async getJobs(@Req() req: Request) {
    const tenantId = req['tenantId'] as string;
    return this.jobService.getJobs(tenantId);
  }

  @Get(':jobId')
  async getJob(@Param('jobId') jobId: string, @Req() req: Request) {
    const tenantId = req['tenantId'] as string;
    return this.jobService.getJobsById(tenantId, jobId);
  }

  @Put(':jobId')
  async updateJob(
    @Param('jobId') jobId: string,
    @Body() updateJobPayload: UpdateJobDto,
    @Req() req: Request,
  ) {
    const tenantId = req['tenantId'] as string;
    return this.jobService.updateJob(tenantId, jobId, updateJobPayload);
  }

  @Delete(':jobId')
  async deleteJob(@Param('jobId') jobId: string, @Req() req: Request) {
    const tenantId = req['tenantId'] as string;
    return this.jobService.deleteJob(tenantId, jobId);
  }

  @Put(':jobId/publish')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'HR')
  async publishJob(@Param('jobId') jobId: string, @Req() req: Request) {
    const tenantId = req['tenantId'] as string;
    return this.jobService.publishJob(tenantId, jobId);
  }

  @Put(':jobId/unpublish')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'HR')
  async unpublishJob(@Param('jobId') jobId: string, @Req() req: Request) {
    const tenantId = req['tenantId'] as string;
    return this.jobService.unpublishJob(tenantId, jobId);
  }
}
