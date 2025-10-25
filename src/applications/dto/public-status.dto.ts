import { IsString, IsNotEmpty } from 'class-validator';

/**
 * Query parameters for public status endpoint
 */
export class PublicStatusQueryDto {
  @IsString()
  @IsNotEmpty()
  token: string;
}

/**
 * Response DTO for public application status
 * Contains minimal information without PII
 */
export class PublicStatusResponseDto {
  job_title: string;
  stage_names: string[];
  current_stage_index: number;
  status: string;
}
