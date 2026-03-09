import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Plan } from './plan.entity';

@Entity('plan_features')
export class PlanFeature {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'plan_id' })
  planId: string;

  @ManyToOne(() => Plan, (plan) => plan.features, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'plan_id' })
  plan: Plan;

  @Column({ name: 'feature_key', length: 100 })
  featureKey: string; // 'max_users', 'max_okrs', 'ai_enabled', 'api_calls_per_month', etc.

  @Column({ type: 'varchar', length: 255 })
  value: string; // '5', '100', 'true', 'unlimited'

  @Column({ type: 'text', nullable: true })
  description: string;
}
