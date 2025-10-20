import { IsInt, IsOptional, IsString, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export interface PublicJobDto {
  id: string;
  title: string;
  department?: string;
  location?: string;
  description_excerpt: string;
  publish_at: Date;
  updated_at: Date;
  extra?: Record<string, unknown>;
}

export interface PublicJobDetailDto {
  id: string;
  title: string;
  department?: string;
  location?: string;
  description?: string;
  publish_at: Date;
  updated_at: Date;
  extra?: Record<string, unknown>;
}

export interface PublicJobsResponseDto {
  data: PublicJobDto[];
  total: number;
}

export class GetPublicJobsQueryDto {
  @IsString()
  @IsOptional()
  search?: string;

  @IsString()
  @IsOptional()
  department?: string;

  @IsString()
  @IsOptional()
  location?: string;

  @IsInt()
  @Min(1)
  @IsOptional()
  @Type(() => Number)
  page?: number = 1;

  @IsInt()
  @Min(1)
  @Max(100)
  @IsOptional()
  @Type(() => Number)
  pageSize?: number = 10;
}
