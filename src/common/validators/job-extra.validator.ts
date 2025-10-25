import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';
import { Injectable, Inject, Scope } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import { SchemaValidationService } from '../../tenant/schema-validation.service';

@ValidatorConstraint({ name: 'ValidateJobExtra', async: true })
@Injectable({ scope: Scope.REQUEST })
export class ValidateJobExtraConstraint
  implements ValidatorConstraintInterface
{
  constructor(
    private readonly schemaValidationService: SchemaValidationService,
    @Inject(REQUEST) private readonly request: Request,
  ) {}

  async validate(
    value: Record<string, unknown> | undefined,
    _args: ValidationArguments,
  ): Promise<boolean> {
    // Get tenantId from request (set by middleware) or header (fallback)
    if (!this.request) {
      // If request is not available, skip validation
      return true;
    }

    // Try to get tenantId from request (set by middleware first)
    let tenantId: string | undefined = this.request.tenantId as string;

    // Fallback to header if middleware hasn't set it yet
    if (!tenantId && this.request.headers) {
      tenantId = (this.request.headers['x-tenant-id'] ||
        this.request.headers['X-Tenant-Id'] ||
        this.request['X-Tenant-ID']) as string;
    }

    if (!tenantId) {
      // If no tenantId is available, we can't validate
      // This shouldn't happen in normal flow as tenantId header is required
      return true;
    }

    // Extract JWT token from Authorization header
    const authHeader = this.request.headers['authorization'] as string;
    let jwtToken = '';
    if (authHeader && authHeader.startsWith('Bearer ')) {
      jwtToken = authHeader.substring(7);
    }

    // If no JWT token, we can't validate (tenant settings requires auth)
    if (!jwtToken) {
      // Fallback to permissive validation
      return true;
    }

    // Get request ID if available
    const requestId = this.request['requestId'] as string | undefined;

    // Validate using the schema validation service
    const result = await this.schemaValidationService.validateJobExtra(
      tenantId,
      value,
      jwtToken,
      requestId,
    );

    // Store errors in the constraint for custom message
    if (!result.valid && result.errors) {
      (this as Record<string, unknown>)['lastErrors'] = result.errors;
    }

    return result.valid;
  }

  defaultMessage(_args: ValidationArguments): string {
    const errors = (this as Record<string, unknown>)['lastErrors'];
    if (Array.isArray(errors) && errors.length > 0) {
      return errors.join('; ');
    }
    return 'Extra field validation failed';
  }
}

export function ValidateJobExtra(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: ValidateJobExtraConstraint,
    });
  };
}
