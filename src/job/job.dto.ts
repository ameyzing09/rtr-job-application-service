/* eslint-disable @typescript-eslint/no-unsafe-call */
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
  is_public?: boolean;

  @IsDate()
  @IsOptional()
  @Type(() => Date)
  publish_at?: Date;

  @IsDate()
  @IsOptional()
  @Type(() => Date)
  @IsPublishBeforeExpire()
  expire_at?: Date;

  @IsUrl()
  @IsOptional()
  external_apply_url?: string;

  @IsObject()
  @IsOptional()
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
  is_public?: boolean;

  @IsDate()
  @IsOptional()
  @Type(() => Date)
  publish_at?: Date;

  @IsDate()
  @IsOptional()
  @Type(() => Date)
  @IsPublishBeforeExpire()
  expire_at?: Date;

  @IsUrl()
  @IsOptional()
  external_apply_url?: string;

  @IsObject()
  @IsOptional()
  extra?: Record<string, unknown>;
}
