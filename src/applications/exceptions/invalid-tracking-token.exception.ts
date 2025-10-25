import { NotFoundException } from '@nestjs/common';

/**
 * Exception thrown when an invalid or non-existent tracking token is provided
 */
export class InvalidTrackingTokenException extends NotFoundException {
  constructor() {
    super('Invalid or expired tracking token');
  }
}
