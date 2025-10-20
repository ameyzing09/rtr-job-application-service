/**
 * Extracts the subdomain from a host header.
 * Examples:
 *   "acme.api.company.com" => "acme"
 *   "localhost" => null
 *   "127.0.0.1" => null
 *   "api.company.com" => null (assuming 2-level TLD)
 */
export function extractSubdomain(host: string): string | null {
  if (!host) {
    return null;
  }

  // Remove port if present
  const hostWithoutPort = host.split(':')[0];

  // Handle localhost and IPs
  if (
    hostWithoutPort === 'localhost' ||
    /^\d+\.\d+\.\d+\.\d+$/.test(hostWithoutPort)
  ) {
    return null;
  }

  // Split by dots
  const parts = hostWithoutPort.split('.');

  // If we have less than 3 parts (e.g., "api.com"), there's no subdomain
  // Assuming format: subdomain.domain.tld (3+ parts)
  if (parts.length < 3) {
    return null;
  }

  // Return the first part as subdomain
  return parts[0];
}
