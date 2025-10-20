/**
 * Generic interface for CAPTCHA providers.
 * Allows swapping between Cloudflare Turnstile, hCaptcha, reCAPTCHA, etc.
 */
export interface ICaptchaService {
  /**
   * Verifies a CAPTCHA token with the provider's API.
   * @param token - The token received from the client-side CAPTCHA widget
   * @param remoteIp - Optional: The user's IP address for additional validation
   * @returns Promise<boolean> - True if verification succeeds, false otherwise
   */
  verify(token: string, remoteIp?: string): Promise<boolean>;

  /**
   * Returns the provider name for logging purposes.
   */
  getProviderName(): string;
}
