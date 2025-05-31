import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Job } from './job.entity';
import { Repository } from 'typeorm';
import { UpdateJobDto } from './job.dto';

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
}
