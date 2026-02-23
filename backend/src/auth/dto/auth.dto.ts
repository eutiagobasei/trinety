import { IsEmail, IsString, MinLength, IsOptional } from 'class-validator';

export class SignUpDto {
  @IsEmail({}, { message: 'Email inválido' })
  email: string;

  @IsString()
  @MinLength(6, { message: 'Senha deve ter no mínimo 6 caracteres' })
  password: string;

  @IsString()
  @IsOptional()
  fullName?: string;
}

export class SignInDto {
  @IsEmail({}, { message: 'Email inválido' })
  email: string;

  @IsString()
  password: string;
}

export class SwitchOrganizationDto {
  @IsString()
  organizationId: string;
}

export interface AuthResponse {
  user: {
    id: string;
    email: string;
    fullName: string;
    isSystemAdmin: boolean;
    activeOrganizationId: string | null;
  };
  accessToken: string;
  refreshToken: string;
}
