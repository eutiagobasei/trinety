import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { UserOrganization } from './user-organization.entity';
import { Organization } from './organization.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  @Index('idx_users_email')
  email: string;

  @Column()
  password: string;

  @Column({ name: 'full_name', nullable: true })
  fullName: string;

  @Column({ name: 'is_system_admin', default: false })
  @Index('idx_users_is_system_admin')
  isSystemAdmin: boolean;

  @Column({ name: 'active_organization_id', nullable: true })
  @Index('idx_users_active_organization_id')
  activeOrganizationId: string;

  @ManyToOne(() => Organization, { nullable: true })
  @JoinColumn({ name: 'active_organization_id' })
  activeOrganization: Organization;

  @OneToMany(() => UserOrganization, (uo) => uo.user)
  userOrganizations: UserOrganization[];

  @CreateDateColumn({ name: 'created_at' })
  @Index('idx_users_created_at')
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
