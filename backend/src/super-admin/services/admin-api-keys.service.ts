import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, FindOptionsWhere } from 'typeorm';
import { ApiKey } from '../../database/entities/api-key.entity';
import { ApiUsageLog } from '../../database/entities/api-usage-log.entity';
import { EncryptionService } from '../../common/services/encryption.service';
import {
  CreateApiKeyDto,
  UpdateApiKeyDto,
  ApiKeyResponseDto,
  ApiUsageQueryDto,
} from '../dto/admin-api-key.dto';

@Injectable()
export class AdminApiKeysService {
  constructor(
    @InjectRepository(ApiKey)
    private apiKeyRepo: Repository<ApiKey>,
    @InjectRepository(ApiUsageLog)
    private usageLogRepo: Repository<ApiUsageLog>,
    private encryptionService: EncryptionService,
  ) {}

  async findAll(): Promise<ApiKeyResponseDto[]> {
    const keys = await this.apiKeyRepo.find({
      order: { provider: 'ASC' },
    });

    return keys.map((key) => this.toResponseDto(key));
  }

  async findById(id: string) {
    const key = await this.apiKeyRepo.findOne({ where: { id } });
    if (!key) {
      throw new NotFoundException('Chave de API não encontrada');
    }
    return key;
  }

  async create(dto: CreateApiKeyDto): Promise<ApiKeyResponseDto> {
    // Check if provider already has a key
    const existing = await this.apiKeyRepo.findOne({
      where: { provider: dto.provider },
    });

    if (existing) {
      throw new ConflictException(
        `Já existe uma chave para o provedor "${dto.provider}". Atualize a existente.`,
      );
    }

    const encryptedKey = this.encryptionService.encrypt(dto.apiKey);
    const keyPrefix = this.encryptionService.getKeyPrefix(dto.apiKey);

    const apiKey = this.apiKeyRepo.create({
      provider: dto.provider,
      displayName: dto.displayName,
      encryptedKey,
      keyPrefix,
    });

    const saved = await this.apiKeyRepo.save(apiKey);
    return this.toResponseDto(saved);
  }

  async update(id: string, dto: UpdateApiKeyDto): Promise<ApiKeyResponseDto> {
    const key = await this.findById(id);

    if (dto.displayName) {
      key.displayName = dto.displayName;
    }

    if (dto.apiKey) {
      key.encryptedKey = this.encryptionService.encrypt(dto.apiKey);
      key.keyPrefix = this.encryptionService.getKeyPrefix(dto.apiKey);
    }

    if (typeof dto.isActive === 'boolean') {
      key.isActive = dto.isActive;
    }

    const saved = await this.apiKeyRepo.save(key);
    return this.toResponseDto(saved);
  }

  async delete(id: string) {
    const key = await this.findById(id);
    await this.apiKeyRepo.delete(id);
    return { deleted: true, provider: key.provider };
  }

  /**
   * Get the decrypted API key for internal use
   * This should NOT be exposed via API
   */
  async getDecryptedKey(provider: string): Promise<string | null> {
    const key = await this.apiKeyRepo.findOne({
      where: { provider, isActive: true },
    });

    if (!key) {
      return null;
    }

    // Update usage stats
    key.lastUsedAt = new Date();
    key.usageCount += 1;
    await this.apiKeyRepo.save(key);

    return this.encryptionService.decrypt(key.encryptedKey);
  }

  async getUsageLogs(query: ApiUsageQueryDto) {
    const { page = 1, limit = 50, provider, organizationId, startDate, endDate, errorsOnly } = query;
    const skip = (page - 1) * limit;

    const where: FindOptionsWhere<ApiUsageLog> = {};

    if (provider) {
      where.provider = provider;
    }

    if (organizationId) {
      where.organizationId = organizationId;
    }

    if (errorsOnly) {
      where.success = false;
    }

    const queryBuilder = this.usageLogRepo
      .createQueryBuilder('log')
      .leftJoinAndSelect('log.organization', 'org');

    if (provider) {
      queryBuilder.andWhere('log.provider = :provider', { provider });
    }

    if (organizationId) {
      queryBuilder.andWhere('log.organizationId = :organizationId', { organizationId });
    }

    if (errorsOnly) {
      queryBuilder.andWhere('log.success = false');
    }

    if (startDate) {
      queryBuilder.andWhere('log.createdAt >= :startDate', { startDate });
    }

    if (endDate) {
      queryBuilder.andWhere('log.createdAt <= :endDate', { endDate });
    }

    queryBuilder
      .orderBy('log.createdAt', 'DESC')
      .skip(skip)
      .take(limit);

    const [data, total] = await queryBuilder.getManyAndCount();

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getUsageStats(startDate?: string, endDate?: string) {
    const queryBuilder = this.usageLogRepo
      .createQueryBuilder('log')
      .select('log.provider', 'provider')
      .addSelect('COUNT(*)', 'totalCalls')
      .addSelect('SUM(CASE WHEN log.success THEN 1 ELSE 0 END)', 'successfulCalls')
      .addSelect('SUM(CASE WHEN NOT log.success THEN 1 ELSE 0 END)', 'failedCalls')
      .addSelect('SUM(log.totalTokens)', 'totalTokens')
      .addSelect('SUM(log.cost)', 'totalCost')
      .addSelect('AVG(log.responseTimeMs)', 'avgResponseTime')
      .groupBy('log.provider');

    if (startDate) {
      queryBuilder.andWhere('log.createdAt >= :startDate', { startDate });
    }

    if (endDate) {
      queryBuilder.andWhere('log.createdAt <= :endDate', { endDate });
    }

    return queryBuilder.getRawMany();
  }

  private toResponseDto(key: ApiKey): ApiKeyResponseDto {
    return {
      id: key.id,
      provider: key.provider,
      displayName: key.displayName,
      keyPrefix: key.keyPrefix,
      isActive: key.isActive,
      lastUsedAt: key.lastUsedAt,
      usageCount: key.usageCount,
      createdAt: key.createdAt,
      updatedAt: key.updatedAt,
    };
  }
}
