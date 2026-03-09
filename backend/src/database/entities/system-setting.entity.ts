import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  UpdateDateColumn,
} from 'typeorm';

export enum SettingValueType {
  STRING = 'string',
  NUMBER = 'number',
  BOOLEAN = 'boolean',
  JSON = 'json',
}

@Entity('system_settings')
export class SystemSetting {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, length: 100 })
  key: string; // 'maintenance_mode', 'default_plan', 'app_name', etc.

  @Column({ type: 'text' })
  value: string;

  @Column({
    name: 'value_type',
    type: 'enum',
    enum: SettingValueType,
    default: SettingValueType.STRING,
  })
  valueType: SettingValueType;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ name: 'is_public', default: false })
  isPublic: boolean; // Can be accessed without auth

  @Column({ length: 50, nullable: true })
  category: string; // 'general', 'email', 'security', etc.

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
