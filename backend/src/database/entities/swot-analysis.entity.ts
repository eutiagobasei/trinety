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

@Entity('swot_analysis')
export class SwotAnalysis {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'session_id' })
  sessionId: string;

  @Column({ type: 'text', nullable: true })
  forcas: string;

  @Column({ type: 'text', nullable: true })
  fraquezas: string;

  @Column({ type: 'text', nullable: true })
  oportunidades: string;

  @Column({ type: 'text', nullable: true })
  ameacas: string;

  @Column({ type: 'text', nullable: true })
  combinacoes: string;

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
