import {
  BadRequestException,
  Injectable,
  NotFoundException,
  Logger,
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
import { PipelineService } from '../pipeline/pipeline.service';
import { generateTrackingToken } from '../common/utils/token.util';
import { AdvanceApplicationResponseDto } from './dto/advance-application.dto';
import { RejectApplicationResponseDto } from './dto/reject-application.dto';
import { PublicStatusResponseDto } from './dto/public-status.dto';
import { ApplicationAtLastStageException } from './exceptions/application-at-last-stage.exception';
import { InvalidTrackingTokenException } from './exceptions/invalid-tracking-token.exception';
import { InjectMetric } from '@willsoto/nestjs-prometheus';
import { Counter } from 'prom-client';

@Injectable()
export class ApplicationsService {
  private readonly logger = new Logger(ApplicationsService.name);

  constructor(
    @InjectRepository(Job)
    private readonly jobRepository: Repository<Job>,
    @InjectRepository(Application)
    private readonly applicationRepository: Repository<Application>,
    private readonly pipelineService: PipelineService,
    @InjectMetric('application_stage_transitions_total')
    private readonly stageTransitionCounter: Counter,
  ) {}

  async createApplication(
    tenantId: string,
    createApplicationPayload: CreateApplicationDto,
    jwtToken?: string,
    requestId?: string,
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

    // Generate tracking token
    const trackingToken = generateTrackingToken();

    // Get or create pipeline assignment
    let pipelineId: string | undefined;
    if (jwtToken) {
      try {
        const assignment = await this.pipelineService.getPipelineAssignment(
          job.id,
          jwtToken,
          tenantId,
          requestId,
        );

        if (!assignment) {
          // Create default pipeline
          this.logger.log(
            `No pipeline assignment found for job ${job.id}, creating default pipeline`,
          );
          const defaultAssignment =
            await this.pipelineService.createDefaultPipeline(
              job.id,
              tenantId,
              jwtToken,
              requestId,
            );
          pipelineId = defaultAssignment.pipeline_id;
        } else {
          pipelineId = assignment.pipeline_id;
        }
      } catch (error: unknown) {
        const errorMessage =
          error instanceof Error ? error.message : 'Unknown error';
        this.logger.warn(
          `Failed to get/create pipeline for job ${job.id}: ${errorMessage}`,
        );
        // Continue with null pipeline - graceful degradation
      }
    }

    const application = this.applicationRepository.create({
      ...createApplicationPayload,
      tenantId: tenantId,
      jobId: job.id,
      trackingToken,
      pipelineId,
      currentStageIndex: 0,
      status: pipelineId ? 'IN_PROGRESS' : 'PENDING',
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

    // Generate tracking token
    const trackingToken = generateTrackingToken();

    // Note: Public applications don't have JWT token, so pipeline integration
    // is handled separately by admins or defaults to null
    let pipelineId: string | undefined;
    try {
      // We don't have JWT token for public submissions, so we log and continue
      this.logger.log(
        `Public application submitted for job ${job.id} - pipeline assignment will be handled by admin`,
      );
      // Pipeline can be assigned later by admin, for now it's null
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.warn(
        `Pipeline setup skipped for public application: ${errorMessage}`,
      );
    }

    // Create application with tracking token
    const application = this.applicationRepository.create({
      tenantId: tenantId,
      jobId: applicationData.job_id,
      applicantName: applicationData.applicant_name,
      applicantEmail: applicationData.applicant_email,
      applicantPhone: applicationData.applicant_phone,
      resumeUrl: applicationData.resume_url,
      coverLetter: applicationData.cover_letter,
      trackingToken,
      pipelineId,
      currentStageIndex: 0,
      status: pipelineId ? 'IN_PROGRESS' : 'PENDING',
    });

    const savedApplication = await this.applicationRepository.save(application);

    const id: string = savedApplication.id;
    const status:
      | 'PENDING'
      | 'REVIEWED'
      | 'REJECTED'
      | 'HIRED'
      | 'IN_PROGRESS' = savedApplication.status;

    const result: PublicApplicationResponseDto = {
      id,
      status,
      tracking_token: savedApplication.trackingToken,
    };

    return result;
  }

  /**
   * Advance an application to the next stage in the pipeline
   * @param tenantId Tenant ID
   * @param applicationId Application ID
   * @param jwtToken JWT token for authorization
   * @param requestId Request ID for tracing
   * @throws ApplicationAtLastStageException if already at last stage
   * @throws NotFoundException if application or pipeline not found
   */
  async advanceApplication(
    tenantId: string,
    applicationId: string,
    jwtToken: string,
    requestId?: string,
  ): Promise<AdvanceApplicationResponseDto> {
    const application = await this.getApplicationById(tenantId, applicationId);

    if (!application.pipelineId) {
      throw new BadRequestException(
        'Application does not have an assigned pipeline',
      );
    }

    // Fetch pipeline to get stage count
    const pipeline = await this.pipelineService.getPipelineById(
      application.pipelineId,
      jwtToken,
      tenantId,
      requestId,
    );

    const maxStageIndex = pipeline.stages.length - 1;

    // Check if already at last stage
    if (application.currentStageIndex >= maxStageIndex) {
      throw new ApplicationAtLastStageException(applicationId);
    }

    // Advance to next stage
    application.currentStageIndex += 1;
    const savedApplication = await this.applicationRepository.save(application);

    // Record metrics
    this.stageTransitionCounter.inc({
      tenant_id: tenantId,
      action: 'advance',
    });

    this.logger.log(
      `Application ${applicationId} advanced to stage ${savedApplication.currentStageIndex}`,
    );

    return {
      id: savedApplication.id,
      tenantId: savedApplication.tenantId,
      jobId: savedApplication.jobId,
      pipelineId: savedApplication.pipelineId,
      currentStageIndex: savedApplication.currentStageIndex,
      status: savedApplication.status,
      updatedAt: savedApplication.updatedAt,
    };
  }

  /**
   * Reject an application
   * @param tenantId Tenant ID
   * @param applicationId Application ID
   * @throws NotFoundException if application not found
   */
  async rejectApplication(
    tenantId: string,
    applicationId: string,
  ): Promise<RejectApplicationResponseDto> {
    const application = await this.getApplicationById(tenantId, applicationId);

    // Idempotent operation - don't error if already rejected
    application.status = 'REJECTED';
    const savedApplication = await this.applicationRepository.save(application);

    // Record metrics
    this.stageTransitionCounter.inc({
      tenant_id: tenantId,
      action: 'reject',
    });

    this.logger.log(`Application ${applicationId} has been rejected`);

    return {
      id: savedApplication.id,
      tenantId: savedApplication.tenantId,
      jobId: savedApplication.jobId,
      status: savedApplication.status,
      updatedAt: savedApplication.updatedAt,
    };
  }

  /**
   * Get public status of an application by tracking token
   * @param trackingToken Tracking token
   * @throws InvalidTrackingTokenException if token is invalid
   */
  async getPublicStatus(
    trackingToken: string,
  ): Promise<PublicStatusResponseDto> {
    const application = await this.applicationRepository.findOne({
      where: { trackingToken },
      relations: ['job'],
    });

    if (!application) {
      throw new InvalidTrackingTokenException();
    }

    // Fetch pipeline stages if available
    let stageNames: string[] = [];
    if (application.pipelineId) {
      try {
        // For public endpoint, we need to handle auth differently
        // We'll use a system-level call or fetch without auth
        // For now, we'll return empty stage names or implement later
        stageNames = ['Stage 1', 'Stage 2', 'Stage 3']; // Placeholder
        this.logger.warn(
          'Pipeline stage names not fetched - requires system-level auth',
        );
      } catch (error: unknown) {
        const errorMessage =
          error instanceof Error ? error.message : 'Unknown error';
        this.logger.error(`Failed to fetch pipeline stages: ${errorMessage}`);
      }
    }

    return {
      job_title: application.job.title,
      stage_names: stageNames,
      current_stage_index: application.currentStageIndex,
      status: application.status,
    };
  }
}
