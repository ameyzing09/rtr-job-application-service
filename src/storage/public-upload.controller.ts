import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  UseFilters,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { Request } from 'express';
import { Throttle } from '@nestjs/throttler';
import { StorageService } from './storage.service';
import { PresignUploadRequestDto, PresignedUrlResponseDto } from './storage.dto';
import { TenantThrottlerGuard } from '../common/guards/tenant-throttler.guard';
import { TenantResolverInterceptor } from '../common/interceptors/tenant-resolver.interceptor';
import { ThrottleExceptionFilter } from '../common/filters/throttle-exception.filter';

/**
 * Public controller for generating presigned upload URLs.
 * No JWT authentication required - protected only by rate limiting.
 */
@Controller('uploads')
@UseFilters(ThrottleExceptionFilter)
@UseInterceptors(TenantResolverInterceptor)
export class PublicUploadController {
  constructor(private readonly storageService: StorageService) {}

  /**
   * Generate a presigned URL for direct browser-to-storage file uploads.
   *
   * Rate limited to prevent abuse (10 requests/hour per IP+tenant).
   * Validates file type (pdf, doc, docx) and enforces size limit (5MB).
   *
   * @param body - File upload request containing fileName and fileType
   * @param req - Express request with tenantId attached by interceptor
   * @returns Presigned URL details for upload
   */
  @Post('presign')
  @HttpCode(HttpStatus.OK)
  @UseGuards(TenantThrottlerGuard)
  @Throttle({ default: { limit: 10, ttl: 3600000 } }) // 10 requests per hour
  getPresignedUrl(
    @Body() body: PresignUploadRequestDto,
    @Req() req: Request,
  ): PresignedUrlResponseDto {
    const tenantId = req['tenantId'] as string;

    return this.storageService.getPresignedUrl(
      tenantId,
      body.fileName,
      body.fileType,
    );
  }
}
