import {
  Controller,
  Get,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { SuperAdmin } from '../../common/decorators/super-admin.decorator';
import { AdminDashboardService } from '../services/admin-dashboard.service';

@Controller('admin/dashboard')
@SuperAdmin()
@ApiTags('Super Admin - Dashboard')
export class AdminDashboardController {
  constructor(private readonly service: AdminDashboardService) {}

  @Get()
  @ApiOperation({ summary: 'Visão geral do sistema' })
  @ApiResponse({ status: 200, description: 'Estatísticas gerais' })
  getOverview() {
    return this.service.getOverview();
  }

  @Get('activity')
  @ApiOperation({ summary: 'Atividade recente' })
  @ApiResponse({ status: 200, description: 'Organizações e usuários recentes' })
  getRecentActivity(@Query('limit') limit?: number) {
    return this.service.getRecentActivity(limit || 10);
  }

  @Get('api-usage')
  @ApiOperation({ summary: 'Visão geral de uso de API' })
  @ApiResponse({ status: 200, description: 'Estatísticas de uso de API' })
  getApiUsageOverview(@Query('days') days?: number) {
    return this.service.getApiUsageOverview(days || 30);
  }

  @Get('growth')
  @ApiOperation({ summary: 'Crescimento de organizações' })
  @ApiResponse({ status: 200, description: 'Dados de crescimento' })
  getOrganizationGrowth(@Query('days') days?: number) {
    return this.service.getOrganizationGrowth(days || 90);
  }

  @Get('top-usage')
  @ApiOperation({ summary: 'Organizações com maior uso de API' })
  @ApiResponse({ status: 200, description: 'Top organizações por uso' })
  getTopOrganizationsByUsage(@Query('limit') limit?: number) {
    return this.service.getTopOrganizationsByUsage(limit || 10);
  }
}
