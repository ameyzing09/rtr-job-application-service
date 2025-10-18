import {
  IsBoolean,
  IsDate,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  IsUrl,
} from 'class-validator';
import { Type } from 'class-transformer';
import { IsPublishBeforeExpire } from '../common/validators/date-range.validator';
import { ValidateJobExtra } from '../common/validators/job-extra.validator';

export class CreateJobDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  description: string;

  @IsString()
  @IsOptional()
  location: string;

  @IsString()
  @IsOptional()
  department?: string;

  @IsBoolean()
  @IsOptional()
  isPublic?: boolean;

  @IsDate()
  @IsOptional()
  @Type(() => Date)
  publishAt?: Date;

  @IsDate()
  @IsOptional()
  @Type(() => Date)
  @IsPublishBeforeExpire()
  expireAt?: Date;

  @IsUrl()
  @IsOptional()
  externalApplyUrl?: string;

  @IsObject()
  @IsOptional()
  @ValidateJobExtra()
  extra?: Record<string, unknown>;
}

export class UpdateJobDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  location?: string;

  @IsString()
  @IsOptional()
  department?: string;

  @IsBoolean()
  @IsOptional()
  isPublic?: boolean;

  @IsDate()
  @IsOptional()
  @Type(() => Date)
  publishAt?: Date;

  @IsDate()
  @IsOptional()
  @Type(() => Date)
  @IsPublishBeforeExpire()
  expireAt?: Date;

  @IsUrl()
  @IsOptional()
  externalApplyUrl?: string;

  @IsObject()
  @IsOptional()
  @ValidateJobExtra()
  extra?: Record<string, unknown>;
}
