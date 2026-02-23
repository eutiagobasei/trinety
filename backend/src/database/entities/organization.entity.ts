import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  BeforeInsert,
} from 'typeorm';
import { UserOrganization } from './user-organization.entity';
import { v4 as uuidv4 } from 'uuid';

@Entity('organizations')
export class Organization {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ unique: true })
  code: string;

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
