import { IsString, IsOptional, IsUUID, IsBoolean, IsObject, MinLength, IsEmail } from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { PaginationQueryDto } from '../../common/dto/pagination.dto';

export class AdminCreateOrganizationDto {
  @ApiProperty({ description: 'Nome da organização' })
  @IsString()
  @MinLength(2)
  name: string;

  @ApiPropertyOptional({ description: 'Email de cobrança' })
  @IsOptional()
  @IsEmail()
  billingEmail?: string;

  @ApiPropertyOptional({ description: 'ID do plano' })
  @IsOptional()
  @IsUUID()
  planId?: string;

  @ApiPropertyOptional({ description: 'URL do logo' })
  @IsOptional()
  @IsString()
  logoUrl?: string;
}

export class AdminUpdateOrganizationDto extends PartialType(AdminCreateOrganizationDto) {
  @ApiPropertyOptional({ description: 'Configurações customizadas' })
  @IsOptional()
  @IsObject()
  settings?: Record<string, any>;

  @ApiPropertyOptional({ description: 'Organização está ativa' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class AdminOrganizationQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ description: 'Filtrar por status ativo' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ description: 'Buscar por nome ou código' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ description: 'Filtrar por plano' })
  @IsOptional()
  @IsUUID()
  planId?: string;
}

export class OrganizationResponseDto {
  id: string;
  name: string;
  code: string;
  isActive: boolean;
  planId: string | null;
  planName?: string;
  billingEmail: string | null;
  logoUrl: string | null;
  usersCount?: number;
  createdAt: Date;
  updatedAt: Date;
}
