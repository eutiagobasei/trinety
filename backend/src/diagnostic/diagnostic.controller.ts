import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { IsInt, IsString, Min } from 'class-validator';
import { DiagnosticService } from './diagnostic.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

class SaveAnswerDto {
  @IsInt()
  @Min(0)
  blockIndex: number;

  @IsInt()
  @Min(0)
  questionIndex: number;

  @IsString()
  answer: string;
}

@Controller('organizations/:orgId/diagnostic')
@UseGuards(JwtAuthGuard)
export class DiagnosticController {
  constructor(private readonly diagnosticService: DiagnosticService) {}

  @Get()
  async getDiagnostic(@Param('orgId') orgId: string, @Request() req) {
    return this.diagnosticService.getAnswers(orgId, req.user.userId);
  }

  @Post()
  async createDiagnostic(@Param('orgId') orgId: string, @Request() req) {
    const diagnostic = await this.diagnosticService.getOrCreateDiagnostic(orgId, req.user.userId);
    return { diagnostic: { id: diagnostic.id, sessionId: diagnostic.sessionId, completed: diagnostic.completed }, answers: [] };
  }

  @Post('answers')
  async saveAnswer(
    @Param('orgId') orgId: string,
    @Body() dto: SaveAnswerDto,
    @Request() req,
  ) {
    return this.diagnosticService.saveAnswer(
      orgId,
      req.user.userId,
      dto.blockIndex,
      dto.questionIndex,
      dto.answer,
    );
  }

  @Post('complete')
  async completeDiagnostic(@Param('orgId') orgId: string, @Request() req) {
    return this.diagnosticService.completeDiagnostic(orgId, req.user.userId);
  }

  @Post('reset')
  async resetDiagnostic(@Param('orgId') orgId: string, @Request() req) {
    return this.diagnosticService.resetDiagnostic(orgId, req.user.userId);
  }
}
