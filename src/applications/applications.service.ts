import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Job } from 'src/job/job.entity';
import { Application } from './applications.entity';
import { Repository } from 'typeorm';
import { CreateApplicationDto } from './applications.dto';

@Injectable()
export class ApplicationsService {
  constructor(
    @InjectRepository(Job)
    private readonly jobRepository: Repository<Job>,
    @InjectRepository(Application)
    private readonly applicationRepository: Repository<Application>,
  ) {}

  async createApplication(
    tenantId: string,
    createApplicationPayload: CreateApplicationDto,
  ) {
    const job = await this.jobRepository.findOne({
      where: {
        tenant_id: tenantId,
        id: createApplicationPayload.jobId,
      },
    });
    if (!job) {
      throw new Error(
        `Job with ID ${createApplicationPayload.jobId} not found for tenant ${tenantId}`,
      );
    }
    const application = this.applicationRepository.create({
      ...createApplicationPayload,
      tenant_id: tenantId,
      job_id: job.id,
    });
    return this.applicationRepository.save(application);
  }

  async getApplications(tenantId: string) {
    return this.applicationRepository.find({
      where: { tenant_id: tenantId },
      order: { created_at: 'DESC' },
    });
  }

  async getApplicationById(tenantId: string, applicationId: string) {
    const application = await this.applicationRepository.findOne({
      where: { tenant_id: tenantId, id: applicationId },
    });
    if (!application) {
      throw new NotFoundException(
        `Application with ID ${applicationId} not found for tenant ${tenantId}`,
      );
    }
    return application;
  }

  async updateApplication(
    tenantId: string,
    applicationId: string,
    updateApplicationPayload: Partial<CreateApplicationDto>,
  ) {
    const application = await this.getApplicationById(tenantId, applicationId);
    Object.assign(application, updateApplicationPayload);
    return this.applicationRepository.save(application);
  }

  async deleteApplication(tenantId: string, applicationId: string) {
    const application = await this.getApplicationById(tenantId, applicationId);
    await this.applicationRepository.remove(application);
  }
}
