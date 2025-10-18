import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

interface DateRangeObject {
  publishAt?: Date;
  expireAt?: Date;
}

@ValidatorConstraint({ name: 'isPublishBeforeExpire', async: false })
export class IsPublishBeforeExpireConstraint
  implements ValidatorConstraintInterface
{
  validate(expireAt: Date | undefined, args: ValidationArguments): boolean {
    const obj = args.object as DateRangeObject;
    const publishAt = obj.publishAt;

    // If either date is missing, skip validation (handled by @IsOptional)
    if (!publishAt || !expireAt) {
      return true;
    }

    // Ensure publishAt is before expireAt
    return publishAt < expireAt;
  }

  defaultMessage(_args: ValidationArguments): string {
    return 'publishAt must be before expireAt';
  }
}

export function IsPublishBeforeExpire(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsPublishBeforeExpireConstraint,
    });
  };
}
