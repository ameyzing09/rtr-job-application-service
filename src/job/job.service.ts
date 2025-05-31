import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Job } from './job.entity';
import { Repository } from 'typeorm';

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
}
