import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ICaptchaService } from './captcha.interface';
import { HCaptchaVerifyResponse } from './captcha.dto';

/**
 * hCaptcha service implementation.
 * hCaptcha is a privacy-focused CAPTCHA alternative with monetization options.
 *
 * Configuration required:
 * - HCAPTCHA_SECRET_KEY: Secret key from hCaptcha dashboard
 *
 * API Documentation: https://docs.hcaptcha.com/#verify-the-user-response-server-side
 */
@Injectable()
export class HCaptchaService implements ICaptchaService {
  private readonly logger = new Logger(HCaptchaService.name);
  private readonly secretKey: string;
  private readonly verifyUrl = 'https://api.hcaptcha.com/siteverify';

  constructor(private readonly configService: ConfigService) {
    this.secretKey = this.configService.get<string>('HCAPTCHA_SECRET_KEY', '');

    if (!this.secretKey) {
      this.logger.warn(
        'HCAPTCHA_SECRET_KEY not configured. CAPTCHA verification will fail.',
      );
    }
  }

  async verify(token: string, remoteIp?: string): Promise<boolean> {
    if (!this.secretKey) {
      this.logger.error('HCAPTCHA_SECRET_KEY not configured');
      return false;
    }

    if (!token) {
      this.logger.warn('CAPTCHA token is empty');
      return false;
    }

    try {
      const params = new URLSearchParams({
        secret: this.secretKey,
        response: token,
      });

      if (remoteIp) {
        params.append('remoteip', remoteIp);
      }

      const response = await fetch(this.verifyUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: params.toString(),
      });

      if (!response.ok) {
        this.logger.error(
          `hCaptcha API returned ${response.status}: ${response.statusText}`,
        );
        return false;
      }

      const data = (await response.json()) as HCaptchaVerifyResponse;

      if (!data.success) {
        this.logger.warn(
          `hCaptcha verification failed: ${JSON.stringify(data['error-codes'])}`,
        );
        return false;
      }

      this.logger.debug('hCaptcha verification successful');
      return true;
    } catch (error) {
      this.logger.error(
        `hCaptcha verification error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      return false;
    }
  }

  getProviderName(): string {
    return 'hCaptcha';
  }
}
