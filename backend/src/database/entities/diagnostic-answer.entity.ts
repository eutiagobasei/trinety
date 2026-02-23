import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';
import { Diagnostic } from './diagnostic.entity';
import { Organization } from './organization.entity';

@Entity('diagnostic_answers')
@Unique(['diagnosticId', 'blockIndex', 'questionIndex'])
export class DiagnosticAnswer {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'diagnostic_id' })
  diagnosticId: string;

  @Column({ name: 'block_index' })
  blockIndex: number;

  @Column({ name: 'question_index' })
  questionIndex: number;

  @Column({ type: 'text' })
  answer: string;

  @Column({ name: 'organization_id' })
  organizationId: string;

  @ManyToOne(() => Diagnostic, (diagnostic) => diagnostic.answers, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'diagnostic_id' })
  diagnostic: Diagnostic;

  @ManyToOne(() => Organization, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'organization_id' })
  organization: Organization;
}
