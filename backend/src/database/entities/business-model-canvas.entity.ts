import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Organization } from './organization.entity';

@Entity('business_model_canvas')
export class BusinessModelCanvas {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'session_id' })
  sessionId: string;

  @Column({ type: 'text', nullable: true })
  segmentos: string;

  @Column({ type: 'text', nullable: true })
  proposta: string;

  @Column({ type: 'text', nullable: true })
  canais: string;

  @Column({ type: 'text', nullable: true })
  relacionamento: string;

  @Column({ type: 'text', nullable: true })
  atividades: string;

  @Column({ type: 'text', nullable: true })
  recursos: string;

  @Column({ type: 'text', nullable: true })
  parceiros: string;

  @Column({ type: 'text', nullable: true })
  custos: string;

  @Column({ type: 'text', nullable: true })
  receitas: string;

  @Column({ name: 'organization_id' })
  organizationId: string;

  @ManyToOne(() => Organization, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'organization_id' })
  organization: Organization;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
