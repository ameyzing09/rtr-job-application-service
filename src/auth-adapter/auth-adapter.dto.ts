/**
 * Tenant information from user-auth-service
 */
export interface TenantDto {
  id: string;
  slug: string;
  name: string;
}

/**
 * Tenant settings from user-auth-service
 */
export interface TenantSettingsDto {
  tenant_id: string;
  config: {
    job_fields_schema?: Record<string, unknown>;
    [key: string]: unknown;
  };
  created_at: number;
  updated_at: number;
}
