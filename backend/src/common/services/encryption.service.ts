import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';

@Injectable()
export class EncryptionService implements OnModuleInit {
  private readonly algorithm = 'aes-256-gcm';
  private key: Buffer;

  constructor(private configService: ConfigService) {}

  onModuleInit() {
    const secret = this.configService.get<string>('ENCRYPTION_SECRET');
    if (!secret) {
      console.warn('ENCRYPTION_SECRET not set. Using default (NOT SECURE FOR PRODUCTION)');
      this.key = crypto.scryptSync('default-dev-secret-change-me', 'salt', 32);
    } else {
      this.key = crypto.scryptSync(secret, 'salt', 32);
    }
  }

  encrypt(text: string): string {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(this.algorithm, this.key, iv);

    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    const authTag = cipher.getAuthTag();

    // Return IV + AuthTag + Encrypted data, all in hex
    return iv.toString('hex') + ':' + authTag.toString('hex') + ':' + encrypted;
  }

  decrypt(encryptedText: string): string {
    const parts = encryptedText.split(':');
    if (parts.length !== 3) {
      throw new Error('Invalid encrypted text format');
    }

    const iv = Buffer.from(parts[0], 'hex');
    const authTag = Buffer.from(parts[1], 'hex');
    const encrypted = parts[2];

    const decipher = crypto.createDecipheriv(this.algorithm, this.key, iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  }

  /**
   * Get a prefix of the key for identification (e.g., "sk-proj...")
   */
  getKeyPrefix(key: string, length: number = 10): string {
    if (key.length <= length) {
      return key.substring(0, 4) + '...';
    }
    return key.substring(0, length) + '...';
  }
}
