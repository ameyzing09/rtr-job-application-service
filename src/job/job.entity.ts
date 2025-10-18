import { Application } from '../applications/applications.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  Index,
} from 'typeorm';

@Entity('jobs')
@Index('idx_jobs_tenant', ['tenantId'])
@Index('idx_jobs_tenant_title', ['tenantId', 'title'])
@Index('idx_jobs_public', ['tenantId', 'isPublic', 'publishAt'])
export class Job {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'tenant_id', type: 'uuid' })
  tenantId: string;

  @Column()
  title: string;

  @Column({ nullable: true })
  description?: string;

  @Column({ nullable: true })
  location?: string;

  @Column({ nullable: true })
  department?: string;

  @Column({ name: 'is_public', type: 'boolean', default: false })
  isPublic: boolean;

  @Column({ name: 'publish_at', type: 'datetime', nullable: true })
  publishAt?: Date;

  @Column({ name: 'expire_at', type: 'datetime', nullable: true })
  expireAt?: Date;

  @Column({ name: 'external_apply_url', length: 255, nullable: true })
  externalApplyUrl?: string;

  @Column({ type: 'json', nullable: true })
  extra?: Record<string, unknown>;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToMany(() => Application, (application) => application.job)
  applications: Application[];
}
