import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { SuperAdmin } from '../../common/decorators/super-admin.decorator';
import { AdminPlansService } from '../services/admin-plans.service';
import {
  CreatePlanDto,
  UpdatePlanDto,
  CreatePlanFeatureDto,
  UpdatePlanFeatureDto,
} from '../dto/admin-plan.dto';

@Controller('admin/plans')
@SuperAdmin()
@ApiTags('Super Admin - Plans')
export class AdminPlansController {
  constructor(private readonly service: AdminPlansService) {}

  @Get()
  @ApiOperation({ summary: 'Listar todos os planos' })
  @ApiResponse({ status: 200, description: 'Lista de planos' })
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Detalhes de um plano' })
  @ApiResponse({ status: 200, description: 'Detalhes do plano' })
  @ApiResponse({ status: 404, description: 'Plano não encontrado' })
  findById(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.findById(id);
  }

  @Post()
  @ApiOperation({ summary: 'Criar novo plano' })
  @ApiResponse({ status: 201, description: 'Plano criado' })
  @ApiResponse({ status: 409, description: 'Código do plano já existe' })
  create(@Body() dto: CreatePlanDto) {
    return this.service.create(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar plano' })
  @ApiResponse({ status: 200, description: 'Plano atualizado' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdatePlanDto,
  ) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Excluir plano' })
  @ApiResponse({ status: 200, description: 'Plano excluído ou desativado' })
  delete(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.delete(id);
  }

  @Post(':id/assign/:orgId')
  @ApiOperation({ summary: 'Atribuir plano a uma organização' })
  @ApiResponse({ status: 200, description: 'Plano atribuído' })
  assignToOrganization(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('orgId', ParseUUIDPipe) orgId: string,
  ) {
    return this.service.assignToOrganization(id, orgId);
  }

  @Get(':id/features')
  @ApiOperation({ summary: 'Listar features de um plano' })
  @ApiResponse({ status: 200, description: 'Lista de features' })
  getFeatures(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.getFeatures(id);
  }

  @Post(':id/features')
  @ApiOperation({ summary: 'Adicionar feature a um plano' })
  @ApiResponse({ status: 201, description: 'Feature adicionada' })
  addFeature(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CreatePlanFeatureDto,
  ) {
    return this.service.addFeature(id, dto);
  }

  @Patch(':id/features/:featureId')
  @ApiOperation({ summary: 'Atualizar feature de um plano' })
  @ApiResponse({ status: 200, description: 'Feature atualizada' })
  updateFeature(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('featureId', ParseUUIDPipe) featureId: string,
    @Body() dto: UpdatePlanFeatureDto,
  ) {
    return this.service.updateFeature(id, featureId, dto);
  }

  @Delete(':id/features/:featureId')
  @ApiOperation({ summary: 'Remover feature de um plano' })
  @ApiResponse({ status: 200, description: 'Feature removida' })
  deleteFeature(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('featureId', ParseUUIDPipe) featureId: string,
  ) {
    return this.service.deleteFeature(id, featureId);
  }
}
