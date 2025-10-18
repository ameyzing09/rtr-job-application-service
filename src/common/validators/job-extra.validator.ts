import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';
import { Injectable, Inject, Scope } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { SchemaValidationService } from '../../tenant/schema-validation.service';

@ValidatorConstraint({ name: 'ValidateJobExtra', async: true })
@Injectable({ scope: Scope.REQUEST })
export class ValidateJobExtraConstraint
  implements ValidatorConstraintInterface
{
  constructor(
    private readonly schemaValidationService: SchemaValidationService,
    @Inject(REQUEST) private readonly request: Record<string, unknown>,
  ) {}

  async validate(
    value: Record<string, unknown> | undefined,
    _args: ValidationArguments,
  ): Promise<boolean> {
    // Get tenantId from the request (set by TenantMiddleware)
    const tenantId = this.request['tenantId'] as string;

    if (!tenantId) {
      // If no tenantId is available, we can't validate
      // This shouldn't happen in normal flow as tenantId is set by middleware
      return true;
    }

    // Validate using the schema validation service
    const result = await this.schemaValidationService.validateJobExtra(
      tenantId,
      value,
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
