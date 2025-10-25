/**
 * Response DTO for rejecting an application
 */
export class RejectApplicationResponseDto {
  id: string;
  tenantId: string;
  jobId: string;
  status: string;
  updatedAt: Date;
}
