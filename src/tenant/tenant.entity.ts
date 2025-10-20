import { Entity, PrimaryGeneratedColumn, Column, Index } from 'typeorm';

@Entity('tenants')
@Index('idx_tenant_slug', ['slug'])
export class Tenant {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  slug: string;

  @Column()
  name: string;
}
