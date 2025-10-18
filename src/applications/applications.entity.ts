import { Job } from '../job/job.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('applications')
@Index('idx_app_tenant', ['tenantId'])
@Index('idx_app_job', ['job_id'])
@Index('idx_app_tenant_status', ['tenantId', 'status'])
export class Application {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  tenantId: string;

  @Column({ name: 'job_id', type: 'uuid' })
  job_id: string;

  @Column()
  applicant_name: string;

  @Column()
  applicant_email: string;

  @Column({ nullable: true })
  applicant_phone?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  resume_url?: string;

  @Column({ type: 'text', nullable: true })
  cover_letter?: string;

  @Column({
    type: 'enum',
    enum: ['PENDING', 'REVIEWED', 'REJECTED', 'HIRED'],
    default: 'PENDING',
  })
  status: 'PENDING' | 'REVIEWED' | 'REJECTED' | 'HIRED';

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at: Date;

  @ManyToOne(() => Job, (job) => job.applications, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'job_id' })
  job: Job;
}
