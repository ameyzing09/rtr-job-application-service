/* eslint-disable @typescript-eslint/no-unsafe-call */
import { IsNotEmpty, IsObject, IsOptional, IsString } from 'class-validator';

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

  @IsObject()
  @IsOptional()
  extra?: Record<string, unknown>;
}
