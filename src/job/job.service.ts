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

  async createJob(tenantId: string, jobPayload: Partial<Job>): Promise<Job> {
    const job = this.jobRepository.create({
      ...jobPayload,
      tenantId,
    });
    return this.jobRepository.save(job);
  }

  async getJobs(tenantId: string): Promise<Job[]> {
    return this.jobRepository.find({
      where: { tenantId },
      order: { createdAt: 'DESC' },
    });
  }

  async getJobsById(tenantId: string, jobId: string): Promise<Job> {
    const job = await this.jobRepository.findOne({
      where: { tenantId, id: jobId },
    });
    if (!job)
      throw new NotFoundException(
        `Job with ID ${jobId} not found for tenant ${tenantId}`,
      );

    return job;
  }

  async updateJob(
    tenantId: string,
    jobId: string,
    updateJobPayload: UpdateJobDto,
  ): Promise<Job> {
    const job = await this.getJobsById(tenantId, jobId);
    Object.assign(job, updateJobPayload);
    return this.jobRepository.save(job);
  }

  async deleteJob(tenantId: string, jobId: string): Promise<void> {
    const job = await this.getJobsById(tenantId, jobId);
    await this.jobRepository.remove(job);
  }

  async publishJob(tenantId: string, jobId: string): Promise<Job> {
    const job = await this.getJobsById(tenantId, jobId);
    job.isPublic = true;
    if (!job.publishAt) {
      job.publishAt = new Date();
    }
    return this.jobRepository.save(job);
  }

  async unpublishJob(tenantId: string, jobId: string): Promise<Job> {
    const job = await this.getJobsById(tenantId, jobId);
    job.isPublic = false;
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
      .where('job.tenantId = :tenantId', { tenantId })
      .andWhere('job.isPublic = :isPublic', { isPublic: true })
      .andWhere('job.publishAt <= :now', { now })
      .andWhere(
        new Brackets((qb) => {
          qb.where('job.expireAt IS NULL').orWhere('job.expireAt >= :now', {
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
    query.orderBy('job.publishAt', 'DESC').skip(skip).take(pageSize);

    const [jobs, total] = await query.getManyAndCount();

    // Transform to PublicJobDto
    const data: PublicJobDto[] = jobs.map((job) => ({
      id: job.id,
      title: job.title,
      department: job.department,
      location: job.location,
      description_excerpt: this.createDescriptionExcerpt(job.description),
      publish_at: job.publishAt as Date,
      updated_at: job.updatedAt,
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
        tenantId: tenantId,
      },
    });

    // Validate job exists and meets public criteria
    if (!job) {
      throw new NotFoundException(`Job with ID ${jobId} not found`);
    }

    if (!job.isPublic) {
      throw new NotFoundException(`Job with ID ${jobId} not found`);
    }

    if (!job.publishAt || job.publishAt > now) {
      throw new NotFoundException(`Job with ID ${jobId} not found`);
    }

    if (job.expireAt && job.expireAt < now) {
      throw new NotFoundException(`Job with ID ${jobId} not found`);
    }

    // Transform to PublicJobDetailDto
    return {
      id: job.id,
      title: job.title,
      department: job.department,
      location: job.location,
      description: job.description,
      publish_at: job.publishAt,
      updated_at: job.updatedAt,
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
