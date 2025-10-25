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
@Index('idx_app_job', ['jobId'])
@Index('idx_app_tenant_status', ['tenantId', 'status'])
@Index('idx_app_tenant_pipeline', ['tenantId', 'pipelineId'])
@Index('idx_app_tenant_created', ['tenantId', 'createdAt'])
@Index('idx_app_tracking_token', ['trackingToken'], { unique: true })
export class Application {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'tenant_id', type: 'uuid' })
  tenantId: string;

  @Column({ name: 'job_id', type: 'uuid' })
  jobId: string;

  @Column({ name: 'applicant_name' })
  applicantName: string;

  @Column({ name: 'applicant_email' })
  applicantEmail: string;

  @Column({ name: 'applicant_phone', nullable: true })
  applicantPhone?: string;

  @Column({ name: 'resume_url', type: 'varchar', length: 255, nullable: true })
  resumeUrl?: string;

  @Column({ name: 'cover_letter', type: 'text', nullable: true })
  coverLetter?: string;

  @Column({ name: 'pipeline_id', type: 'uuid', nullable: true })
  pipelineId?: string;

  @Column({ name: 'current_stage_index', type: 'int', default: 0 })
  currentStageIndex: number;

  @Column({ name: 'tracking_token', type: 'varchar', length: 64, unique: true })
  trackingToken: string;

  @Column({
    type: 'enum',
    enum: ['PENDING', 'REVIEWED', 'REJECTED', 'HIRED', 'IN_PROGRESS'],
    default: 'PENDING',
  })
  status: 'PENDING' | 'REVIEWED' | 'REJECTED' | 'HIRED' | 'IN_PROGRESS';

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => Job, (job) => job.applications, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'job_id' })
  job: Job;
}
