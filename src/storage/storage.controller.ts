import {
  BadRequestException,
  Controller,
  Get,
  NotFoundException,
  Query,
  Req,
} from '@nestjs/common';
import { Request } from 'express';
import { StorageService } from './storage.service';
import { TenantService } from '../tenant/tenant.service';
import {
  GetPresignedUrlQueryDto,
  PresignedUrlResponseDto,
} from './storage.dto';
import { extractSubdomain } from '../common/utils/subdomain.util';

@Controller('public/storage')
export class StorageController {
  constructor(
    private readonly storageService: StorageService,
    private readonly tenantService: TenantService,
  ) {}

  @Get('presigned-url')
  async getPresignedUrl(
    @Query() query: GetPresignedUrlQueryDto,
    @Req() req: Request,
  ): Promise<PresignedUrlResponseDto> {
    // Extract subdomain from host header
    const host = req.headers.host;
    if (!host) {
      throw new BadRequestException('Host header is missing');
    }

    const subdomain = extractSubdomain(host);
    if (!subdomain) {
      throw new BadRequestException('Subdomain required in host header');
    }

    // Look up tenant by slug
    const tenant = await this.tenantService.findBySlug(subdomain);
    if (!tenant) {
      throw new NotFoundException('Tenant not found');
    }

    // Generate presigned URL with tenant context
    // Default to PDF if contentType is not provided
    const fileType = query.contentType || 'application/pdf';
    return this.storageService.getPresignedUrl(
      tenant.id,
      query.filename,
      fileType,
    );
  }
}
