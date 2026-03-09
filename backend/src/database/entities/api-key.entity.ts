import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('api_keys')
export class ApiKey {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, length: 50 })
  provider: string; // 'openai', 'anthropic', 'stripe', etc.

  @Column({ name: 'display_name', length: 100 })
  displayName: string;

  @Column({ name: 'encrypted_key', type: 'text' })
  encryptedKey: string; // AES-256 encrypted

  @Column({ name: 'key_prefix', length: 20, nullable: true })
  keyPrefix: string; // First chars for identification (e.g., "sk-proj...")

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @Column({ name: 'last_used_at', nullable: true })
  lastUsedAt: Date;

  @Column({ name: 'usage_count', default: 0 })
  usageCount: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
