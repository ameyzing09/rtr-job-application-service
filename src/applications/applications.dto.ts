import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateApplicationDto {
  @IsString()
  @IsNotEmpty()
  jobId: string;

  @IsString()
  @IsNotEmpty()
  applicantName: string;

  @IsString()
  @IsNotEmpty()
  applicantEmail: string;

  @IsString()
  @IsNotEmpty()
  applicantPhone: string;

  @IsString()
  @IsNotEmpty()
  resumeUrl: string;

  @IsString()
  @IsOptional()
  coverLetter?: string;

  @IsString()
  @IsNotEmpty()
  status?: 'PENDING' | 'REVIEWED' | 'REJECTED' | 'HIRED';
}
