import { IsNotEmpty, IsOptional, IsString, Matches } from 'class-validator';

export class GetPresignedUrlQueryDto {
  @IsString()
  @IsNotEmpty()
  filename: string;

  @IsString()
  @IsOptional()
  contentType?: string;
}

export class PresignUploadRequestDto {
  @IsString()
  @IsNotEmpty()
  fileName: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^(application\/pdf|application\/msword|application\/vnd\.openxmlformats-officedocument\.wordprocessingml\.document)$/, {
    message:
      'File type not allowed. Allowed types: application/pdf, application/msword, application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  })
  fileType: string;
}

export interface PresignedUrlResponseDto {
  uploadUrl: string;
  fileUrl: string;
  expiresIn: number;
}

// File upload constants
export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB in bytes
export const ALLOWED_FILE_TYPES = {
  'application/pdf': 'pdf',
  'application/msword': 'doc',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
    'docx',
} as const;

export const ALLOWED_FILE_EXTENSIONS = ['pdf', 'doc', 'docx'] as const;
