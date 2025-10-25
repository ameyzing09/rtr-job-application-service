/**
 * Response from GET /pipeline/assignment?job_id=...
 */
export interface PipelineAssignmentDto {
  pipeline_id: string;
  job_id: string;
}

/**
 * Stage information within a pipeline
 */
export interface PipelineStageDto {
  id: string;
  name: string;
  order: number;
}

/**
 * Response from GET /pipeline/:id
 */
export interface PipelineTemplateDto {
  id: string;
  name: string;
  tenant_id: string;
  stages: PipelineStageDto[];
}

/**
 * Request body for creating a default pipeline
 */
export interface CreateDefaultPipelineDto {
  job_id: string;
  tenant_id: string;
}
