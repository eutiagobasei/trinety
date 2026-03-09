import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { StrategicPlanningService } from './strategic-planning.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('organizations/:orgId/strategic-planning')
@UseGuards(JwtAuthGuard)
export class StrategicPlanningController {
  constructor(private readonly planningService: StrategicPlanningService) {}

  @Post('generate')
  async generatePlan(@Param('orgId') orgId: string, @Request() req) {
    return this.planningService.generateStrategicPlan(orgId, req.user.userId);
  }

  // Business Model Canvas
  @Get('canvas')
  async getCanvas(@Param('orgId') orgId: string, @Request() req) {
    return this.planningService.getCanvas(orgId, req.user.userId);
  }

  @Put('canvas')
  async updateCanvas(@Param('orgId') orgId: string, @Body() data: any, @Request() req) {
    return this.planningService.updateCanvas(orgId, req.user.userId, data);
  }

  // Empathy Map
  @Get('empathy-map')
  async getEmpathyMap(@Param('orgId') orgId: string, @Request() req) {
    return this.planningService.getEmpathyMap(orgId, req.user.userId);
  }

  @Put('empathy-map')
  async updateEmpathyMap(@Param('orgId') orgId: string, @Body() data: any, @Request() req) {
    return this.planningService.updateEmpathyMap(orgId, req.user.userId, data);
  }

  // SWOT
  @Get('swot')
  async getSwot(@Param('orgId') orgId: string, @Request() req) {
    return this.planningService.getSwot(orgId, req.user.userId);
  }

  @Put('swot')
  async updateSwot(@Param('orgId') orgId: string, @Body() data: any, @Request() req) {
    return this.planningService.updateSwot(orgId, req.user.userId, data);
  }

  // Filosofia
  @Get('filosofia')
  async getFilosofia(@Param('orgId') orgId: string, @Request() req) {
    return this.planningService.getFilosofia(orgId, req.user.userId);
  }

  @Put('filosofia')
  async updateFilosofia(@Param('orgId') orgId: string, @Body() data: any, @Request() req) {
    return this.planningService.updateFilosofia(orgId, req.user.userId, data);
  }

  // OKRs
  @Get('okrs')
  async getOkrs(@Param('orgId') orgId: string, @Request() req) {
    return this.planningService.getOkrs(orgId, req.user.userId);
  }

  @Put('okrs')
  async updateAllOkrs(@Param('orgId') orgId: string, @Body() data: any[], @Request() req) {
    return this.planningService.updateAllOkrs(orgId, req.user.userId, data);
  }

  @Put('okrs/:okrId')
  async updateOkr(
    @Param('orgId') orgId: string,
    @Param('okrId') okrId: string,
    @Body() data: any,
    @Request() req,
  ) {
    return this.planningService.updateOkr(orgId, req.user.userId, okrId, data);
  }

  // Indicators
  @Get('indicators')
  async getIndicators(@Param('orgId') orgId: string, @Request() req) {
    return this.planningService.getIndicators(orgId, req.user.userId);
  }

  @Put('indicators')
  async updateAllIndicators(@Param('orgId') orgId: string, @Body() data: any[], @Request() req) {
    return this.planningService.updateAllIndicators(orgId, req.user.userId, data);
  }

  @Put('indicators/:indicatorId')
  async updateIndicator(
    @Param('orgId') orgId: string,
    @Param('indicatorId') indicatorId: string,
    @Body() data: any,
    @Request() req,
  ) {
    return this.planningService.updateIndicator(orgId, req.user.userId, indicatorId, data);
  }

  // Action Plan
  @Get('action-plan')
  async getActionPlan(@Param('orgId') orgId: string, @Request() req) {
    return this.planningService.getActionPlan(orgId, req.user.userId);
  }

  @Put('action-plan')
  async updateAllActions(@Param('orgId') orgId: string, @Body() data: any[], @Request() req) {
    return this.planningService.updateAllActions(orgId, req.user.userId, data);
  }

  @Put('action-plan/:actionId')
  async updateAction(
    @Param('orgId') orgId: string,
    @Param('actionId') actionId: string,
    @Body() data: any,
    @Request() req,
  ) {
    return this.planningService.updateAction(orgId, req.user.userId, actionId, data);
  }

  // Management Routines
  @Get('routines')
  async getRoutines(@Param('orgId') orgId: string, @Request() req) {
    return this.planningService.getRoutines(orgId, req.user.userId);
  }

  @Put('routines')
  async updateRoutines(@Param('orgId') orgId: string, @Body() data: any, @Request() req) {
    return this.planningService.updateRoutines(orgId, req.user.userId, data);
  }
}
