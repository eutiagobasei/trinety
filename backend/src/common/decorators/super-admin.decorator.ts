import { applyDecorators, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiUnauthorizedResponse, ApiForbiddenResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { SuperAdminGuard } from '../guards/super-admin.guard';

export function SuperAdmin() {
  return applyDecorators(
    UseGuards(JwtAuthGuard, SuperAdminGuard),
    ApiBearerAuth(),
    ApiUnauthorizedResponse({ description: 'Token inválido ou expirado' }),
    ApiForbiddenResponse({ description: 'Acesso restrito a administradores do sistema' }),
  );
}
