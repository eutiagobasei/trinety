import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { UserOrganization } from './user-organization.entity';
import { Organization } from './organization.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({ name: 'full_name', nullable: true })
  fullName: string;

  @Column({ name: 'is_system_admin', default: false })
  isSystemAdmin: boolean;

  @Column({ name: 'active_organization_id', nullable: true })
  activeOrganizationId: string;

  @ManyToOne(() => Organization, { nullable: true })
  @JoinColumn({ name: 'active_organization_id' })
  activeOrganization: Organization;

  @OneToMany(() => UserOrganization, (uo) => uo.user)
  userOrganizations: UserOrganization[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
