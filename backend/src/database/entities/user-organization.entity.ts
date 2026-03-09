import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Unique,
  Index,
} from 'typeorm';
import { User } from './user.entity';
import { Organization } from './organization.entity';

export enum AppRole {
  ADMIN = 'admin',
  GESTOR = 'gestor',
  USUARIO = 'usuario',
}

@Entity('user_organizations')
@Unique(['userId', 'organizationId'])
export class UserOrganization {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id' })
  @Index('idx_user_organizations_user_id')
  userId: string;

  @Column({ name: 'organization_id' })
  @Index('idx_user_organizations_organization_id')
  organizationId: string;

  @Column({
    type: 'enum',
    enum: AppRole,
    default: AppRole.USUARIO,
  })
  role: AppRole;

  @Column({ name: 'is_owner', default: false })
  isOwner: boolean;

  @ManyToOne(() => User, (user) => user.userOrganizations, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Organization, (org) => org.userOrganizations, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'organization_id' })
  organization: Organization;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
