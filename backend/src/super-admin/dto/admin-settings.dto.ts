import { IsString, IsOptional, IsBoolean, IsEnum, IsObject } from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { SettingValueType } from '../../database/entities/system-setting.entity';

export class CreateSettingDto {
  @ApiProperty({ description: 'Chave única da configuração' })
  @IsString()
  key: string;

  @ApiProperty({ description: 'Valor da configuração' })
  @IsString()
  value: string;

  @ApiPropertyOptional({ description: 'Tipo do valor', enum: SettingValueType })
  @IsOptional()
  @IsEnum(SettingValueType)
  valueType?: SettingValueType;

  @ApiPropertyOptional({ description: 'Descrição da configuração' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Configuração é pública' })
  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;

  @ApiPropertyOptional({ description: 'Categoria da configuração' })
  @IsOptional()
  @IsString()
  category?: string;
}

export class UpdateSettingDto extends PartialType(CreateSettingDto) {}

export class SettingResponseDto {
  id: string;
  key: string;
  value: string;
  valueType: SettingValueType;
  description: string | null;
  isPublic: boolean;
  category: string | null;
  updatedAt: Date;
}

export class BulkUpdateSettingsDto {
  @IsObject()
  settings: Record<string, string>;
}
