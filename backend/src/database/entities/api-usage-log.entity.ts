import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Organization } from './organization.entity';

@Entity('api_usage_logs')
@Index(['provider', 'createdAt'])
@Index(['organizationId', 'createdAt'])
export class ApiUsageLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 50 })
  provider: string; // 'openai', 'anthropic', etc.

  @Column({ name: 'organization_id', nullable: true })
  organizationId: string;

  @ManyToOne(() => Organization, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'organization_id' })
  organization: Organization;

  @Column({ name: 'user_id', nullable: true })
  userId: string;

  @Column({ length: 100 })
  endpoint: string; // 'chat/completions', 'embeddings', etc.

  @Column({ length: 50, nullable: true })
  model: string; // 'gpt-4-turbo-preview', etc.

  @Column({ name: 'input_tokens', default: 0 })
  inputTokens: number;

  @Column({ name: 'output_tokens', default: 0 })
  outputTokens: number;

  @Column({ name: 'total_tokens', default: 0 })
  totalTokens: number;

  @Column({ type: 'decimal', precision: 10, scale: 6, default: 0 })
  cost: number; // Estimated cost in USD

  @Column({ name: 'response_time_ms', default: 0 })
  responseTimeMs: number;

  @Column({ default: true })
  success: boolean;

  @Column({ name: 'error_message', type: 'text', nullable: true })
  errorMessage: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
