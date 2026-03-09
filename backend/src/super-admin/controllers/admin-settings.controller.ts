import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { SuperAdmin } from '../../common/decorators/super-admin.decorator';
import { AdminSettingsService } from '../services/admin-settings.service';
import {
  CreateSettingDto,
  UpdateSettingDto,
  BulkUpdateSettingsDto,
} from '../dto/admin-settings.dto';

@Controller('admin/settings')
@SuperAdmin()
@ApiTags('Super Admin - Settings')
export class AdminSettingsController {
  constructor(private readonly service: AdminSettingsService) {}

  @Get()
  @ApiOperation({ summary: 'Listar todas as configurações' })
  @ApiResponse({ status: 200, description: 'Lista de configurações' })
  findAll() {
    return this.service.findAll();
  }

  @Get('category/:category')
  @ApiOperation({ summary: 'Listar configurações por categoria' })
  @ApiResponse({ status: 200, description: 'Lista de configurações da categoria' })
  findByCategory(@Param('category') category: string) {
    return this.service.findByCategory(category);
  }

  @Get(':key')
  @ApiOperation({ summary: 'Obter configuração por chave' })
  @ApiResponse({ status: 200, description: 'Configuração encontrada' })
  @ApiResponse({ status: 404, description: 'Configuração não encontrada' })
  get(@Param('key') key: string) {
    return this.service.get(key);
  }

  @Post()
  @ApiOperation({ summary: 'Criar ou atualizar configuração' })
  @ApiResponse({ status: 201, description: 'Configuração criada/atualizada' })
  create(@Body() dto: CreateSettingDto) {
    return this.service.create(dto);
  }

  @Patch(':key')
  @ApiOperation({ summary: 'Atualizar configuração' })
  @ApiResponse({ status: 200, description: 'Configuração atualizada' })
  update(@Param('key') key: string, @Body() dto: UpdateSettingDto) {
    return this.service.update(key, dto);
  }

  @Post('bulk')
  @ApiOperation({ summary: 'Atualizar múltiplas configurações' })
  @ApiResponse({ status: 200, description: 'Configurações atualizadas' })
  bulkUpdate(@Body() dto: BulkUpdateSettingsDto) {
    return this.service.bulkUpdate(dto.settings);
  }

  @Delete(':key')
  @ApiOperation({ summary: 'Excluir configuração' })
  @ApiResponse({ status: 200, description: 'Configuração excluída' })
  delete(@Param('key') key: string) {
    return this.service.delete(key);
  }
}
