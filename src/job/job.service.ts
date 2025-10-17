import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Job } from './job.entity';
import { Brackets, Repository } from 'typeorm';
import { UpdateJobDto } from './job.dto';
import {
  GetPublicJobsQueryDto,
  PublicJobDto,
  PublicJobDetailDto,
  PublicJobsResponseDto,
} from './public-job.dto';

@Injectable()
export class JobService {
  constructor(
    @InjectRepository(Job)
    private jobRepository: Repository<Job>,
  ) {}

  async createJob(tenant_id: string, jobPayload: Partial<Job>): Promise<Job> {
    const job = this.jobRepository.create({
      ...jobPayload,
      tenant_id,
    });
    return this.jobRepository.save(job);
  }

  async getJobs(tenant_id: string): Promise<Job[]> {
    return this.jobRepository.find({
      where: { tenant_id },
      order: { created_at: 'DESC' },
    });
  }

  async getJobsById(tenant_id: string, jobId: string): Promise<Job> {
    const job = await this.jobRepository.findOne({
      where: { tenant_id, id: jobId },
    });
    if (!job)
      throw new NotFoundException(
        `Job with ID ${jobId} not found for tenant ${tenant_id}`,
      );

    return job;
  }

  async updateJob(
    tenant_id: string,
    jobId: string,
    updateJobPayload: UpdateJobDto,
  ): Promise<Job> {
    const job = await this.getJobsById(tenant_id, jobId);
    Object.assign(job, updateJobPayload);
    return this.jobRepository.save(job);
  }

  async deleteJob(tenant_id: string, jobId: string): Promise<void> {
    const job = await this.getJobsById(tenant_id, jobId);
    await this.jobRepository.remove(job);
  }

  async publishJob(tenant_id: string, jobId: string): Promise<Job> {
    const job = await this.getJobsById(tenant_id, jobId);
    job.is_public = true;
    if (!job.publish_at) {
      job.publish_at = new Date();
    }
    return this.jobRepository.save(job);
  }

  async unpublishJob(tenant_id: string, jobId: string): Promise<Job> {
    const job = await this.getJobsById(tenant_id, jobId);
    job.is_public = false;
    return this.jobRepository.save(job);
  }

  async getPublicJobs(
    tenantId: string,
    queryDto: GetPublicJobsQueryDto,
  ): Promise<PublicJobsResponseDto> {
    const { search, department, location, page = 1, pageSize = 10 } = queryDto;
    const skip = (page - 1) * pageSize;
    const now = new Date();

    const query = this.jobRepository.createQueryBuilder('job');

    // Base filters
    query
      .where('job.tenant_id = :tenantId', { tenantId })
      .andWhere('job.is_public = :isPublic', { isPublic: true })
      .andWhere('job.publish_at <= :now', { now })
      .andWhere(
        new Brackets((qb) => {
          qb.where('job.expire_at IS NULL').orWhere('job.expire_at >= :now', {
            now,
          });
        }),
      );

    // Search filter (across id, title, description, department, location)
    if (search) {
      query.andWhere(
        new Brackets((qb) => {
          qb.where('job.id LIKE :search', { search: `%${search}%` })
            .orWhere('job.title LIKE :search', { search: `%${search}%` })
            .orWhere('job.description LIKE :search', { search: `%${search}%` })
            .orWhere('job.department LIKE :search', { search: `%${search}%` })
            .orWhere('job.location LIKE :search', { search: `%${search}%` });
        }),
      );
    }

    // Department filter
    if (department) {
      query.andWhere('job.department = :department', { department });
    }

    // Location filter
    if (location) {
      query.andWhere('job.location = :location', { location });
    }

    // Ordering and pagination
    query.orderBy('job.publish_at', 'DESC').skip(skip).take(pageSize);

    const [jobs, total] = await query.getManyAndCount();

    // Transform to PublicJobDto
    const data: PublicJobDto[] = jobs.map((job) => ({
      id: job.id,
      title: job.title,
      department: job.department,
      location: job.location,
      description_excerpt: this.createDescriptionExcerpt(job.description),
      publish_at: job.publish_at as Date,
      updated_at: job.updated_at,
      extra: job.extra,
    }));

    return { data, total };
  }

  async getPublicJobById(
    tenantId: string,
    jobId: string,
  ): Promise<PublicJobDetailDto> {
    const now = new Date();

    const job = await this.jobRepository.findOne({
      where: {
        id: jobId,
        tenant_id: tenantId,
      },
    });

    // Validate job exists and meets public criteria
    if (!job) {
      throw new NotFoundException(`Job with ID ${jobId} not found`);
    }

    if (!job.is_public) {
      throw new NotFoundException(`Job with ID ${jobId} not found`);
    }

    if (!job.publish_at || job.publish_at > now) {
      throw new NotFoundException(`Job with ID ${jobId} not found`);
    }

    if (job.expire_at && job.expire_at < now) {
      throw new NotFoundException(`Job with ID ${jobId} not found`);
    }

    // Transform to PublicJobDetailDto
    return {
      id: job.id,
      title: job.title,
      department: job.department,
      location: job.location,
      description: job.description,
      publish_at: job.publish_at,
      updated_at: job.updated_at,
      extra: job.extra,
    };
  }

  private createDescriptionExcerpt(description?: string | null): string {
    if (!description) {
      return '';
    }

    const maxLength = 100;
    if (description.length <= maxLength) {
      return description;
    }

    return description.substring(0, maxLength) + '...';
  }
}
