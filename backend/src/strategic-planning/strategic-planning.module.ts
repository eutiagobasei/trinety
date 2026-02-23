import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BusinessModelCanvas } from '../database/entities/business-model-canvas.entity';
import { EmpathyMap } from '../database/entities/empathy-map.entity';
import { SwotAnalysis } from '../database/entities/swot-analysis.entity';
import { Filosofia } from '../database/entities/filosofia.entity';
import { Okr } from '../database/entities/okr.entity';
import { Indicator } from '../database/entities/indicator.entity';
import { ActionPlan } from '../database/entities/action-plan.entity';
import { ManagementRoutine } from '../database/entities/management-routine.entity';
import { DiagnosticAnswer } from '../database/entities/diagnostic-answer.entity';
import { StrategicPlanningService } from './strategic-planning.service';
import { StrategicPlanningController } from './strategic-planning.controller';
import { AiService } from './ai.service';
import { OrganizationsModule } from '../organizations/organizations.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      BusinessModelCanvas,
      EmpathyMap,
      SwotAnalysis,
      Filosofia,
      Okr,
      Indicator,
      ActionPlan,
      ManagementRoutine,
      DiagnosticAnswer,
    ]),
    OrganizationsModule,
  ],
  controllers: [StrategicPlanningController],
  providers: [StrategicPlanningService, AiService],
  exports: [StrategicPlanningService],
})
export class StrategicPlanningModule {}
