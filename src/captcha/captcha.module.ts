import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ICaptchaService } from './captcha.interface';
import { TurnstileService } from './turnstile.service';
import { HCaptchaService } from './hcaptcha.service';

/**
 * CAPTCHA module providing generic CAPTCHA verification.
 * The actual provider (Turnstile or hCaptcha) is selected via environment configuration.
 */
@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: 'CAPTCHA_SERVICE',
      useFactory: (configService: ConfigService): ICaptchaService | null => {
        const enabled = configService.get<string>('CAPTCHA_ENABLED') === 'true';

        if (!enabled) {
          return null; // CAPTCHA disabled
        }

        const provider = configService
          .get<string>('CAPTCHA_PROVIDER', 'turnstile')
          .toLowerCase();

        switch (provider) {
          case 'turnstile':
            return new TurnstileService(configService);
          case 'hcaptcha':
            return new HCaptchaService(configService);
          default:
            throw new Error(
              `Invalid CAPTCHA_PROVIDER: ${provider}. Must be 'turnstile' or 'hcaptcha'`,
            );
        }
      },
      inject: [ConfigService],
    },
  ],
  exports: ['CAPTCHA_SERVICE'],
})
export class CaptchaModule {}
