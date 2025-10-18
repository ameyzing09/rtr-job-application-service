/**
 * Response from Cloudflare Turnstile siteverify API
 */
export interface TurnstileVerifyResponse {
  success: boolean;
  'error-codes'?: string[];
  challenge_ts?: string;
  hostname?: string;
}

/**
 * Response from hCaptcha siteverify API
 */
export interface HCaptchaVerifyResponse {
  success: boolean;
  'error-codes'?: string[];
  challenge_ts?: string;
  hostname?: string;
}
