import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { SuperAdmin } from '../../common/decorators/super-admin.decorator';
import { AdminOrganizationsService } from '../services/admin-organizations.service';
import {
  AdminCreateOrganizationDto,
  AdminUpdateOrganizationDto,
  AdminOrganizationQueryDto,
} from '../dto/admin-organization.dto';

@Controller('admin/organizations')
@SuperAdmin()
@ApiTags('Super Admin - Organizations')
export class AdminOrganizationsController {
  constructor(private readonly service: AdminOrganizationsService) {}

  @Get()
  @ApiOperation({ summary: 'Listar todas as organizações' })
  @ApiResponse({ status: 200, description: 'Lista de organizações com paginação' })
  findAll(@Query() query: AdminOrganizationQueryDto) {
    return this.service.findAll(query);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Estatísticas das organizações' })
  @ApiResponse({ status: 200, description: 'Estatísticas gerais' })
  getStats() {
    return this.service.getStats();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Detalhes de uma organização' })
  @ApiResponse({ status: 200, description: 'Detalhes da organização' })
  @ApiResponse({ status: 404, description: 'Organização não encontrada' })
  findById(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.findById(id);
  }

  @Get(':id/users')
  @ApiOperation({ summary: 'Listar usuários de uma organização' })
  @ApiResponse({ status: 200, description: 'Lista de usuários' })
  getUsers(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.getUsers(id);
  }

  @Post()
  @ApiOperation({ summary: 'Criar nova organização' })
  @ApiResponse({ status: 201, description: 'Organização criada' })
  create(@Body() dto: AdminCreateOrganizationDto) {
    return this.service.create(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar organização' })
  @ApiResponse({ status: 200, description: 'Organização atualizada' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: AdminUpdateOrganizationDto,
  ) {
    return this.service.update(id, dto);
  }

  @Post(':id/activate')
  @ApiOperation({ summary: 'Ativar organização' })
  @ApiResponse({ status: 200, description: 'Organização ativada' })
  activate(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.activate(id);
  }

  @Post(':id/deactivate')
  @ApiOperation({ summary: 'Desativar organização' })
  @ApiResponse({ status: 200, description: 'Organização desativada' })
  deactivate(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.deactivate(id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Excluir organização (soft delete)' })
  @ApiResponse({ status: 200, description: 'Organização excluída' })
  delete(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.delete(id);
  }
}
