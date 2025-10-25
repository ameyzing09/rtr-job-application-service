/**
 * Response DTO for advancing an application to the next stage
 */
export class AdvanceApplicationResponseDto {
  id: string;
  tenantId: string;
  jobId: string;
  pipelineId?: string;
  currentStageIndex: number;
  status: string;
  updatedAt: Date;
}
