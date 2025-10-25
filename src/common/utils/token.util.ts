import { randomBytes } from 'crypto';

/**
 * Generates a cryptographically secure random tracking token
 * for public application status lookup
 * @returns 32-character URL-safe random string
 */
export function generateTrackingToken(): string {
  return randomBytes(24).toString('base64url'); // 24 bytes = 32 chars in base64url
}
