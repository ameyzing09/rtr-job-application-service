import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

interface DateRangeObject {
  publish_at?: Date;
  expire_at?: Date;
}

@ValidatorConstraint({ name: 'isPublishBeforeExpire', async: false })
export class IsPublishBeforeExpireConstraint
  implements ValidatorConstraintInterface
{
  validate(expireAt: Date | undefined, args: ValidationArguments): boolean {
    const obj = args.object as DateRangeObject;
    const publishAt = obj.publish_at;

    // If either date is missing, skip validation (handled by @IsOptional)
    if (!publishAt || !expireAt) {
      return true;
    }

    // Ensure publish_at is before expire_at
    return publishAt < expireAt;
  }

  defaultMessage(args: ValidationArguments): string {
    return 'publish_at must be before expire_at';
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
