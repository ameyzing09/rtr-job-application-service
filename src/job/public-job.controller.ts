import {
  BadRequestException,
  Controller,
  Get,
  NotFoundException,
  Param,
  Query,
  Req,
} from '@nestjs/common';
import { Request } from 'express';
import { JobService } from './job.service';
import { TenantService } from '../tenant/tenant.service';
import {
  GetPublicJobsQueryDto,
  PublicJobDetailDto,
  PublicJobsResponseDto,
} from './public-job.dto';
import { extractSubdomain } from '../common/utils/subdomain.util';

@Controller('public')
export class PublicJobController {
  constructor(
    private readonly jobService: JobService,
    private readonly tenantService: TenantService,
  ) {}

  @Get('jobs')
  async getPublicJobs(
    @Query() queryDto: GetPublicJobsQueryDto,
    @Req() req: Request,
  ): Promise<PublicJobsResponseDto> {
    // Extract subdomain from host header
    const host = req.headers.host;
    if (!host) {
      throw new BadRequestException('Host header is missing');
    }

    const subdomain = extractSubdomain(host);
    if (!subdomain) {
      throw new BadRequestException('Subdomain required in host header');
    }

    // Look up tenant by slug
    const tenant = await this.tenantService.findBySlug(subdomain);
    if (!tenant) {
      throw new NotFoundException('Tenant not found');
    }

    // Fetch public jobs for this tenant
    return this.jobService.getPublicJobs(tenant.id, queryDto);
  }

  @Get('jobs/:id')
  async getPublicJobById(
    @Param('id') jobId: string,
    @Req() req: Request,
  ): Promise<PublicJobDetailDto> {
    // Extract subdomain from host header
    const host = req.headers.host;
    if (!host) {
      throw new BadRequestException('Host header is missing');
    }

    const subdomain = extractSubdomain(host);
    if (!subdomain) {
      throw new BadRequestException('Subdomain required in host header');
    }

    // Look up tenant by slug
    const tenant = await this.tenantService.findBySlug(subdomain);
    if (!tenant) {
      throw new NotFoundException('Tenant not found');
    }

    // Fetch public job by ID for this tenant
    return await this.jobService.getPublicJobById(tenant.id, jobId);
  }
}
