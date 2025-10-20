import {
  BadRequestException,
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Inject,
  Logger,
  Optional,
  Post,
  Req,
  UseFilters,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { Request } from 'express';
import { Throttle } from '@nestjs/throttler';
import { ApplicationsService } from './applications.service';
import {
  CreatePublicApplicationDto,
  PublicApplicationResponseDto,
} from './public-application.dto';
import { TenantThrottlerGuard } from '../common/guards/tenant-throttler.guard';
import { ThrottleExceptionFilter } from '../common/filters/throttle-exception.filter';
import { TenantResolverInterceptor } from '../common/interceptors/tenant-resolver.interceptor';
import { ICaptchaService } from '../captcha/captcha.interface';

@Controller('public/applications')
@UseFilters(ThrottleExceptionFilter)
@UseInterceptors(TenantResolverInterceptor)
export class PublicApplicationsController {
  private readonly logger = new Logger(PublicApplicationsController.name);

  constructor(
    private readonly applicationsService: ApplicationsService,
    @Optional()
    @Inject('CAPTCHA_SERVICE')
    private readonly captchaService: ICaptchaService | null,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(TenantThrottlerGuard)
  @Throttle({ default: { limit: 10, ttl: 3600000 } }) // 10 requests per hour
  async createApplication(
    @Body() createApplicationDto: CreatePublicApplicationDto,
    @Req() req: Request,
  ): Promise<PublicApplicationResponseDto> {
    // Tenant is already resolved by TenantResolverInterceptor
    const tenantId = req['tenantId'] as string;

    // Validate CAPTCHA if enabled
    if (this.captchaService) {
      if (!createApplicationDto.captcha_token) {
        throw new BadRequestException('CAPTCHA verification required');
      }

      // Extract IP for additional validation
      const ip =
        (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
        (req.headers['x-real-ip'] as string) ||
        req.socket?.remoteAddress ||
        undefined;

      const isValid = await this.captchaService.verify(
        createApplicationDto.captcha_token,
        ip,
      );

      if (!isValid) {
        this.logger.warn(
          `CAPTCHA verification failed - IP: ${ip}, Tenant: ${tenantId}`,
        );
        throw new BadRequestException(
          'CAPTCHA verification failed. Please try again.',
        );
      }

      this.logger.debug(
        `CAPTCHA verification successful - Provider: ${this.captchaService.getProviderName()}`,
      );
    }

    // Create public application
    return this.applicationsService.createPublicApplication(
      tenantId,
      createApplicationDto,
    );
  }
}
