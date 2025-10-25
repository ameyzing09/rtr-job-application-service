import { ConflictException } from '@nestjs/common';

/**
 * Exception thrown when attempting to advance an application that is already at the last stage
 */
export class ApplicationAtLastStageException extends ConflictException {
  constructor(applicationId: string) {
    super(
      `Application ${applicationId} is already at the last stage and cannot be advanced further`,
    );
  }
}
