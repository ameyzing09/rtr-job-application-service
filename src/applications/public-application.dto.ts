import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreatePublicApplicationDto {
  @IsString()
  @IsNotEmpty()
  job_id: string;

  @IsString()
  @IsNotEmpty()
  applicant_name: string;

  @IsEmail()
  @IsNotEmpty()
  applicant_email: string;

  @IsString()
  @IsOptional()
  applicant_phone?: string;

  @IsString()
  @IsOptional()
  resume_url?: string;

  @IsString()
  @IsOptional()
  cover_letter?: string;

  @IsString()
  @IsOptional()
  captcha_token?: string;
}

export interface PublicApplicationResponseDto {
  id: string;
  status: string;
}
