import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Job } from 'src/job/job.entity';
import { Application } from './applications.entity';
import { Repository } from 'typeorm';
import { CreateApplicationDto } from './applications.dto';
import {
  CreatePublicApplicationDto,
  PublicApplicationResponseDto,
} from './public-application.dto';

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
        tenantId: tenantId,
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
      tenantId: tenantId,
      jobId: job.id,
    });
    return this.applicationRepository.save(application);
  }

  async getApplications(tenantId: string) {
    return this.applicationRepository.find({
      where: { tenantId: tenantId },
      order: { createdAt: 'DESC' },
    });
  }

  async getApplicationById(tenantId: string, applicationId: string) {
    const application = await this.applicationRepository.findOne({
      where: { tenantId: tenantId, id: applicationId },
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

  async createPublicApplication(
    tenantId: string,
    applicationData: CreatePublicApplicationDto,
  ): Promise<PublicApplicationResponseDto> {
    const now = new Date();

    // Validate job exists and belongs to tenant
    const job = await this.jobRepository.findOne({
      where: {
        id: applicationData.job_id,
        tenantId: tenantId,
      },
    });

    if (!job) {
      throw new BadRequestException(
        'Job not found or not available for applications',
      );
    }

    // Validate job is public
    if (!job.isPublic) {
      throw new BadRequestException(
        'Job not found or not available for applications',
      );
    }

    // Validate job is published
    if (!job.publishAt || job.publishAt > now) {
      throw new BadRequestException(
        'Job not found or not available for applications',
      );
    }

    // Validate job is not expired
    if (job.expireAt && job.expireAt < now) {
      throw new BadRequestException(
        'Job not found or not available for applications',
      );
    }

    // Create application with PENDING status
    const application = this.applicationRepository.create({
      tenantId: tenantId,
      jobId: applicationData.job_id,
      applicantName: applicationData.applicant_name,
      applicantEmail: applicationData.applicant_email,
      applicantPhone: applicationData.applicant_phone,
      resumeUrl: applicationData.resume_url,
      coverLetter: applicationData.cover_letter,
      status: 'PENDING',
    });

    const savedApplication = await this.applicationRepository.save(application);

    const id: string = savedApplication.id;
    const status: 'PENDING' | 'REVIEWED' | 'REJECTED' | 'HIRED' =
      savedApplication.status;

    const result: PublicApplicationResponseDto = {
      id,
      status,
    };

    return result;
  }
}
