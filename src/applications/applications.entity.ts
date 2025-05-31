import { Job } from '../job/job.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('applications')
export class Application {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  tenant_id: string;

  @Column({ type: 'uuid' })
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
