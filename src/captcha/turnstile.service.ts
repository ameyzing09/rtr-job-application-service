import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ICaptchaService } from './captcha.interface';
import { TurnstileVerifyResponse } from './captcha.dto';

/**
 * Cloudflare Turnstile CAPTCHA service implementation.
 * Turnstile is a privacy-focused CAPTCHA alternative that doesn't require puzzle-solving.
 *
 * Configuration required:
 * - TURNSTILE_SECRET_KEY: Secret key from Cloudflare Turnstile dashboard
 *
 * API Documentation: https://developers.cloudflare.com/turnstile/get-started/server-side-validation/
 */
@Injectable()
export class TurnstileService implements ICaptchaService {
  private readonly logger = new Logger(TurnstileService.name);
  private readonly secretKey: string;
  private readonly verifyUrl =
    'https://challenges.cloudflare.com/turnstile/v0/siteverify';

  constructor(private readonly configService: ConfigService) {
    this.secretKey = this.configService.get<string>('TURNSTILE_SECRET_KEY', '');

    if (!this.secretKey) {
      this.logger.warn(
        'TURNSTILE_SECRET_KEY not configured. CAPTCHA verification will fail.',
      );
    }
  }

  async verify(token: string, remoteIp?: string): Promise<boolean> {
    if (!this.secretKey) {
      this.logger.error('TURNSTILE_SECRET_KEY not configured');
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
          `Turnstile API returned ${response.status}: ${response.statusText}`,
        );
        return false;
      }

      const data: TurnstileVerifyResponse = await response.json();

      if (!data.success) {
        this.logger.warn(
          `Turnstile verification failed: ${JSON.stringify(data['error-codes'])}`,
        );
        return false;
      }

      this.logger.debug('Turnstile verification successful');
      return true;
    } catch (error) {
      this.logger.error(
        `Turnstile verification error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      return false;
    }
  }

  getProviderName(): string {
    return 'Cloudflare Turnstile';
  }
}
