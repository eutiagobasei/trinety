import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SystemSetting, SettingValueType } from '../../database/entities/system-setting.entity';
import { CreateSettingDto, UpdateSettingDto } from '../dto/admin-settings.dto';

@Injectable()
export class AdminSettingsService {
  constructor(
    @InjectRepository(SystemSetting)
    private settingRepo: Repository<SystemSetting>,
  ) {}

  async findAll() {
    return this.settingRepo.find({
      order: { category: 'ASC', key: 'ASC' },
    });
  }

  async findByCategory(category: string) {
    return this.settingRepo.find({
      where: { category },
      order: { key: 'ASC' },
    });
  }

  async get(key: string): Promise<SystemSetting | null> {
    return this.settingRepo.findOne({ where: { key } });
  }

  async getValue<T = string>(key: string, defaultValue?: T): Promise<T> {
    const setting = await this.get(key);

    if (!setting) {
      return defaultValue as T;
    }

    switch (setting.valueType) {
      case SettingValueType.NUMBER:
        return parseFloat(setting.value) as T;
      case SettingValueType.BOOLEAN:
        return (setting.value === 'true') as T;
      case SettingValueType.JSON:
        return JSON.parse(setting.value) as T;
      default:
        return setting.value as T;
    }
  }

  async create(dto: CreateSettingDto) {
    const existing = await this.get(dto.key);
    if (existing) {
      return this.update(dto.key, dto);
    }

    const setting = this.settingRepo.create({
      ...dto,
      valueType: dto.valueType || SettingValueType.STRING,
    });

    return this.settingRepo.save(setting);
  }

  async update(key: string, dto: UpdateSettingDto) {
    const setting = await this.get(key);

    if (!setting) {
      throw new NotFoundException(`Configuração "${key}" não encontrada`);
    }

    Object.assign(setting, dto);
    return this.settingRepo.save(setting);
  }

  async set(key: string, value: string, valueType: SettingValueType = SettingValueType.STRING) {
    const existing = await this.get(key);

    if (existing) {
      existing.value = value;
      existing.valueType = valueType;
      return this.settingRepo.save(existing);
    }

    const setting = this.settingRepo.create({ key, value, valueType });
    return this.settingRepo.save(setting);
  }

  async delete(key: string) {
    const setting = await this.get(key);

    if (!setting) {
      throw new NotFoundException(`Configuração "${key}" não encontrada`);
    }

    await this.settingRepo.delete({ key });
    return { deleted: true, key };
  }

  async getPublicSettings() {
    return this.settingRepo.find({
      where: { isPublic: true },
      select: ['key', 'value', 'valueType'],
    });
  }

  async bulkUpdate(settings: Record<string, string>) {
    const results: SystemSetting[] = [];

    for (const [key, value] of Object.entries(settings)) {
      const existing = await this.get(key);
      if (existing) {
        existing.value = value;
        results.push(await this.settingRepo.save(existing));
      }
    }

    return results;
  }
}
