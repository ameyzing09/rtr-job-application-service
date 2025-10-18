import { Entity, Column, PrimaryColumn } from 'typeorm';

interface TenantConfig {
  job_fields_schema?: Record<string, unknown>;
  [key: string]: unknown;
}

@Entity('tenant_settings')
export class TenantSettings {
  @PrimaryColumn({ type: 'char', length: 36, name: 'tenant_id' })
  tenant_id: string;

  @Column({ type: 'json', nullable: false })
  config: TenantConfig;

  @Column({ type: 'bigint', name: 'created_at' })
  createdAt: number;

  @Column({ type: 'bigint', name: 'updated_at' })
  updatedAt: number;
}
