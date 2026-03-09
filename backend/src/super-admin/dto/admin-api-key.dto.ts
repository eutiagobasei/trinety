import { IsString, IsOptional, IsBoolean, MinLength, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { PaginationQueryDto } from '../../common/dto/pagination.dto';

export class CreateApiKeyDto {
  @ApiProperty({ description: 'Provedor (ex: openai, anthropic, stripe)' })
  @IsString()
  @MinLength(2)
  provider: string;

  @ApiProperty({ description: 'Nome de exibição' })
  @IsString()
  @MinLength(2)
  displayName: string;

  @ApiProperty({ description: 'Chave da API' })
  @IsString()
  @MinLength(10)
  apiKey: string;
}

export class UpdateApiKeyDto {
  @ApiPropertyOptional({ description: 'Nome de exibição' })
  @IsOptional()
  @IsString()
  displayName?: string;

  @ApiPropertyOptional({ description: 'Nova chave da API (deixe vazio para manter atual)' })
  @IsOptional()
  @IsString()
  @MinLength(10)
  apiKey?: string;

  @ApiPropertyOptional({ description: 'Chave está ativa' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class ApiKeyResponseDto {
  id: string;
  provider: string;
  displayName: string;
  keyPrefix: string; // "sk-proj..." masked
  isActive: boolean;
  lastUsedAt: Date | null;
  usageCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export class ApiUsageQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ description: 'Filtrar por provedor' })
  @IsOptional()
  @IsString()
  provider?: string;

  @ApiPropertyOptional({ description: 'Filtrar por organização' })
  @IsOptional()
  @IsString()
  organizationId?: string;

  @ApiPropertyOptional({ description: 'Data inicial' })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({ description: 'Data final' })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({ description: 'Apenas erros' })
  @IsOptional()
  @IsBoolean()
  errorsOnly?: boolean;
}

export class ApiUsageStatsDto {
  provider: string;
  totalCalls: number;
  successfulCalls: number;
  failedCalls: number;
  totalTokens: number;
  totalCost: number;
  avgResponseTime: number;
}
