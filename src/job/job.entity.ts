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
@Index('idx_jobs_tenant', ['tenant_id'])
@Index('idx_jobs_tenant_title', ['tenant_id', 'title'])
@Index('idx_jobs_public', ['tenant_id', 'is_public', 'publish_at'])
export class Job {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  tenant_id: string;

  @Column()
  title: string;

  @Column({ nullable: true })
  description?: string;

  @Column({ nullable: true })
  location?: string;

  @Column({ nullable: true })
  department?: string;

  @Column({ type: 'boolean', default: false })
  is_public: boolean;

  @Column({ type: 'datetime', nullable: true })
  publish_at?: Date;

  @Column({ type: 'datetime', nullable: true })
  expire_at?: Date;

  @Column({ length: 255, nullable: true })
  external_apply_url?: string;

  @Column({ type: 'json', nullable: true })
  extra?: Record<string, unknown>;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at: Date;

  @OneToMany(() => Application, (application) => application.job)
  applications: Application[];
}
