import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToOne,
  JoinColumn,
  BeforeInsert,
  Index,
} from 'typeorm';
import { UserOrganization } from './user-organization.entity';
import { Plan } from './plan.entity';
import { v4 as uuidv4 } from 'uuid';

@Entity('organizations')
export class Organization {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ unique: true })
  code: string;

  @Column({ name: 'is_active', default: true })
  @Index()
  isActive: boolean;

  @Column({ name: 'plan_id', nullable: true })
  planId: string;

  @ManyToOne(() => Plan, (plan) => plan.organizations, { nullable: true })
  @JoinColumn({ name: 'plan_id' })
  plan: Plan;

  @Column({ type: 'jsonb', nullable: true })
  settings: Record<string, any>;

  @Column({ name: 'logo_url', nullable: true })
  logoUrl: string;

  @Column({ name: 'billing_email', nullable: true })
  billingEmail: string;

  @Column({ name: 'deactivated_at', nullable: true })
  deactivatedAt: Date;

  @OneToMany(() => UserOrganization, (uo) => uo.organization)
  userOrganizations: UserOrganization[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @BeforeInsert()
  generateCode() {
    if (!this.code) {
      this.code = uuidv4().substring(0, 8).toUpperCase();
    }
  }
}
