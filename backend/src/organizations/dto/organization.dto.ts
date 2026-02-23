import { IsString, IsEmail, IsEnum, IsOptional, MinLength } from 'class-validator';
import { AppRole } from '../../database/entities/user-organization.entity';

export class CreateOrganizationDto {
  @IsString()
  @MinLength(2, { message: 'Nome deve ter no mínimo 2 caracteres' })
  name: string;
}

export class InviteUserDto {
  @IsEmail({}, { message: 'Email inválido' })
  email: string;

  @IsEnum(AppRole)
  @IsOptional()
  role?: AppRole;
}

export class UpdateMemberRoleDto {
  @IsEnum(AppRole)
  role: AppRole;
}
