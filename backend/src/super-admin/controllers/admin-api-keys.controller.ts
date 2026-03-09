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
import { Throttle } from '@nestjs/throttler';
import { SuperAdmin } from '../../common/decorators/super-admin.decorator';
import { AdminApiKeysService } from '../services/admin-api-keys.service';
import {
  CreateApiKeyDto,
  UpdateApiKeyDto,
  ApiUsageQueryDto,
} from '../dto/admin-api-key.dto';

@Controller('admin/api-keys')
@SuperAdmin()
@ApiTags('Super Admin - API Keys')
export class AdminApiKeysController {
  constructor(private readonly service: AdminApiKeysService) {}

  @Get()
  @ApiOperation({ summary: 'Listar todas as chaves de API (mascaradas)' })
  @ApiResponse({ status: 200, description: 'Lista de chaves' })
  findAll() {
    return this.service.findAll();
  }

  @Post()
  @Throttle({ default: { limit: 5, ttl: 60000 } }) // Max 5 criações por minuto
  @ApiOperation({ summary: 'Criar nova chave de API' })
  @ApiResponse({ status: 201, description: 'Chave criada' })
  @ApiResponse({ status: 409, description: 'Provedor já possui chave' })
  create(@Body() dto: CreateApiKeyDto) {
    return this.service.create(dto);
  }

  @Patch(':id')
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @ApiOperation({ summary: 'Atualizar chave de API' })
  @ApiResponse({ status: 200, description: 'Chave atualizada' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateApiKeyDto,
  ) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Excluir chave de API' })
  @ApiResponse({ status: 200, description: 'Chave excluída' })
  delete(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.delete(id);
  }

  @Get('usage')
  @ApiOperation({ summary: 'Listar logs de uso de API' })
  @ApiResponse({ status: 200, description: 'Lista de logs com paginação' })
  getUsageLogs(@Query() query: ApiUsageQueryDto) {
    return this.service.getUsageLogs(query);
  }

  @Get('usage/stats')
  @ApiOperation({ summary: 'Estatísticas de uso de API' })
  @ApiResponse({ status: 200, description: 'Estatísticas agregadas' })
  getUsageStats(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.service.getUsageStats(startDate, endDate);
  }
}
