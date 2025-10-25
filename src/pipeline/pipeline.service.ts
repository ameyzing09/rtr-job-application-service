import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import {
  PipelineAssignmentDto,
  PipelineTemplateDto,
  CreateDefaultPipelineDto,
} from './pipeline.dto';

@Injectable()
export class PipelineService {
  private readonly logger = new Logger(PipelineService.name);
  private readonly pipelineServiceUrl: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.pipelineServiceUrl = this.configService.get<string>(
      'PIPELINE_SERVICE_URL',
      '',
    );
  }

  /**
   * Get pipeline assignment for a job
   * @param jobId Job ID to check assignment for
   * @param jwtToken JWT token for authorization
   * @param tenantId Tenant ID header
   * @param requestId Request ID for tracing
   * @returns Pipeline assignment or null if not found
   */
  async getPipelineAssignment(
    jobId: string,
    jwtToken: string,
    tenantId: string,
    requestId?: string,
  ): Promise<PipelineAssignmentDto | null> {
    try {
      const headers: Record<string, string> = {
        Authorization: `Bearer ${jwtToken}`,
        'x-tenant-id': tenantId,
      };

      if (requestId) {
        headers['X-Request-Id'] = requestId;
      }

      const response = await firstValueFrom(
        this.httpService.get<PipelineAssignmentDto>(
          `${this.pipelineServiceUrl}/pipeline/assignment`,
          {
            params: { job_id: jobId },
            headers,
          },
        ),
      );

      return response.data;
    } catch (error: unknown) {
      // 404 is expected when no assignment exists
      if (this.isAxiosError(error) && error.response?.status === 404) {
        this.logger.log(`No pipeline assignment found for job ${jobId}`);
        return null;
      }

      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(
        `Failed to get pipeline assignment for job ${jobId}`,
        errorMessage,
      );
      throw error;
    }
  }

  /**
   * Get pipeline template details including stages
   * @param pipelineId Pipeline ID
   * @param jwtToken JWT token for authorization
   * @param tenantId Tenant ID header
   * @param requestId Request ID for tracing
   * @returns Pipeline template with stages
   */
  async getPipelineById(
    pipelineId: string,
    jwtToken: string,
    tenantId: string,
    requestId?: string,
  ): Promise<PipelineTemplateDto> {
    try {
      const headers: Record<string, string> = {
        Authorization: `Bearer ${jwtToken}`,
        'x-tenant-id': tenantId,
      };

      if (requestId) {
        headers['X-Request-Id'] = requestId;
      }

      const response = await firstValueFrom(
        this.httpService.get<PipelineTemplateDto>(
          `${this.pipelineServiceUrl}/pipeline/${pipelineId}`,
          {
            headers,
          },
        ),
      );

      return response.data;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Failed to get pipeline ${pipelineId}`, errorMessage);
      throw error;
    }
  }

  /**
   * Create a default pipeline for a job
   * @param jobId Job ID
   * @param tenantId Tenant ID
   * @param jwtToken JWT token for authorization
   * @param requestId Request ID for tracing
   * @returns Created pipeline assignment
   */
  async createDefaultPipeline(
    jobId: string,
    tenantId: string,
    jwtToken: string,
    requestId?: string,
  ): Promise<PipelineAssignmentDto> {
    try {
      const headers: Record<string, string> = {
        Authorization: `Bearer ${jwtToken}`,
        'x-tenant-id': tenantId,
      };

      if (requestId) {
        headers['X-Request-Id'] = requestId;
      }

      const payload: CreateDefaultPipelineDto = {
        job_id: jobId,
        tenant_id: tenantId,
      };

      const response = await firstValueFrom(
        this.httpService.post<PipelineAssignmentDto>(
          `${this.pipelineServiceUrl}/pipeline/default`,
          payload,
          {
            headers,
          },
        ),
      );

      this.logger.log(
        `Created default pipeline for job ${jobId}: ${response.data.pipeline_id}`,
      );
      return response.data;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(
        `Failed to create default pipeline for job ${jobId}`,
        errorMessage,
      );
      throw error;
    }
  }

  /**
   * Type guard to check if error is an Axios error
   */
  private isAxiosError(
    error: unknown,
  ): error is { response?: { status?: number } } {
    return typeof error === 'object' && error !== null && 'response' in error;
  }
}
