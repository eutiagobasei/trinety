import {
  IsString,
  IsOptional,
  IsNumber,
  IsBoolean,
  IsArray,
  ValidateNested,
  MinLength,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreatePlanFeatureDto {
  @ApiProperty({ description: 'Chave da feature (ex: max_users, ai_enabled)' })
  @IsString()
  featureKey: string;

  @ApiProperty({ description: 'Valor da feature (ex: 5, true, unlimited)' })
  @IsString()
  value: string;

  @ApiPropertyOptional({ description: 'Descrição da feature' })
  @IsOptional()
  @IsString()
  description?: string;
}

export class CreatePlanDto {
  @ApiProperty({ description: 'Código único do plano (ex: free, starter, pro)' })
  @IsString()
  @MinLength(2)
  code: string;

  @ApiProperty({ description: 'Nome do plano' })
  @IsString()
  @MinLength(2)
  name: string;

  @ApiPropertyOptional({ description: 'Descrição do plano' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Preço mensal' })
  @IsNumber()
  @Min(0)
  monthlyPrice: number;

  @ApiProperty({ description: 'Preço anual' })
  @IsNumber()
  @Min(0)
  yearlyPrice: number;

  @ApiPropertyOptional({ description: 'Ordem de exibição' })
  @IsOptional()
  @IsNumber()
  sortOrder?: number;

  @ApiPropertyOptional({ description: 'Features do plano', type: [CreatePlanFeatureDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreatePlanFeatureDto)
  features?: CreatePlanFeatureDto[];
}

export class UpdatePlanDto extends PartialType(CreatePlanDto) {
  @ApiPropertyOptional({ description: 'Plano está ativo' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdatePlanFeatureDto extends PartialType(CreatePlanFeatureDto) {}

export class PlanResponseDto {
  id: string;
  code: string;
  name: string;
  description: string | null;
  monthlyPrice: number;
  yearlyPrice: number;
  isActive: boolean;
  sortOrder: number;
  features: {
    id: string;
    featureKey: string;
    value: string;
    description: string | null;
  }[];
  organizationsCount?: number;
  createdAt: Date;
  updatedAt: Date;
}
