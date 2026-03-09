import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BusinessModelCanvas } from '../database/entities/business-model-canvas.entity';
import { EmpathyMap } from '../database/entities/empathy-map.entity';
import { SwotAnalysis } from '../database/entities/swot-analysis.entity';
import { Filosofia } from '../database/entities/filosofia.entity';
import { Okr } from '../database/entities/okr.entity';
import { Indicator } from '../database/entities/indicator.entity';
import { ActionPlan } from '../database/entities/action-plan.entity';
import { ManagementRoutine } from '../database/entities/management-routine.entity';
import { DiagnosticAnswer } from '../database/entities/diagnostic-answer.entity';
import { OrganizationsService } from '../organizations/organizations.service';
import { AiService } from './ai.service';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class StrategicPlanningService {
  constructor(
    @InjectRepository(BusinessModelCanvas)
    private readonly canvasRepository: Repository<BusinessModelCanvas>,
    @InjectRepository(EmpathyMap)
    private readonly empathyRepository: Repository<EmpathyMap>,
    @InjectRepository(SwotAnalysis)
    private readonly swotRepository: Repository<SwotAnalysis>,
    @InjectRepository(Filosofia)
    private readonly filosofiaRepository: Repository<Filosofia>,
    @InjectRepository(Okr)
    private readonly okrRepository: Repository<Okr>,
    @InjectRepository(Indicator)
    private readonly indicatorRepository: Repository<Indicator>,
    @InjectRepository(ActionPlan)
    private readonly actionPlanRepository: Repository<ActionPlan>,
    @InjectRepository(ManagementRoutine)
    private readonly routineRepository: Repository<ManagementRoutine>,
    @InjectRepository(DiagnosticAnswer)
    private readonly answerRepository: Repository<DiagnosticAnswer>,
    private readonly organizationsService: OrganizationsService,
    private readonly aiService: AiService,
  ) {}

  async generateStrategicPlan(organizationId: string, userId: string) {
    await this.organizationsService.checkAccess(userId, organizationId);

    const answers = await this.answerRepository.find({
      where: { organizationId },
      order: { blockIndex: 'ASC', questionIndex: 'ASC' },
    });

    if (answers.length === 0) {
      throw new NotFoundException('Diagnóstico não encontrado. Complete o diagnóstico primeiro.');
    }

    const diagnosticText = answers
      .map((a) => `Bloco ${a.blockIndex}, Pergunta ${a.questionIndex}: ${a.answer}`)
      .join('\n');

    const sessionId = uuidv4();

    const [canvas, empathy, swot, filosofia, okrs, indicators, actions, routines] =
      await Promise.all([
        this.aiService.generateBusinessCanvas(diagnosticText),
        this.aiService.generateEmpathyMap(diagnosticText),
        this.aiService.generateSwot(diagnosticText),
        this.aiService.generateFilosofia(diagnosticText),
        this.aiService.generateOkrs(diagnosticText),
        this.aiService.generateIndicators(diagnosticText),
        this.aiService.generateActionPlan(diagnosticText),
        this.aiService.generateRoutines(diagnosticText),
      ]);

    await this.saveCanvas(organizationId, sessionId, canvas);
    await this.saveEmpathyMap(organizationId, sessionId, empathy);
    await this.saveSwot(organizationId, sessionId, swot);
    await this.saveFilosofia(organizationId, sessionId, filosofia);
    await this.saveOkrs(organizationId, sessionId, okrs);
    await this.saveIndicators(organizationId, sessionId, indicators);
    await this.saveActionPlan(organizationId, sessionId, actions);
    await this.saveRoutines(organizationId, sessionId, routines);

    return { success: true, sessionId };
  }

  private async saveCanvas(orgId: string, sessionId: string, data: Record<string, string>) {
    await this.canvasRepository.delete({ organizationId: orgId });
    const canvas = this.canvasRepository.create({
      sessionId,
      organizationId: orgId,
      ...data,
    });
    return this.canvasRepository.save(canvas);
  }

  private async saveEmpathyMap(orgId: string, sessionId: string, data: Record<string, string>) {
    await this.empathyRepository.delete({ organizationId: orgId });
    const empathy = this.empathyRepository.create({
      sessionId,
      organizationId: orgId,
      ...data,
    });
    return this.empathyRepository.save(empathy);
  }

  private async saveSwot(orgId: string, sessionId: string, data: Record<string, string>) {
    await this.swotRepository.delete({ organizationId: orgId });
    const swot = this.swotRepository.create({
      sessionId,
      organizationId: orgId,
      ...data,
    });
    return this.swotRepository.save(swot);
  }

  private async saveFilosofia(orgId: string, sessionId: string, data: Record<string, string>) {
    await this.filosofiaRepository.delete({ organizationId: orgId });
    const filosofia = this.filosofiaRepository.create({
      sessionId,
      organizationId: orgId,
      ...data,
    });
    return this.filosofiaRepository.save(filosofia);
  }

  private async saveOkrs(orgId: string, sessionId: string, data: Array<{ objetivo: string; krs: string }>) {
    await this.okrRepository.delete({ organizationId: orgId });
    const okrs = data.map((o) =>
      this.okrRepository.create({
        sessionId,
        organizationId: orgId,
        objetivo: o.objetivo,
        krs: o.krs,
      }),
    );
    return this.okrRepository.save(okrs);
  }

  private async saveIndicators(orgId: string, sessionId: string, data: Array<Record<string, string>>) {
    await this.indicatorRepository.delete({ organizationId: orgId });
    const indicators = data.map((i) =>
      this.indicatorRepository.create({
        sessionId,
        organizationId: orgId,
        nome: i.nome,
        descricao: i.descricao,
        meta: i.meta,
        origem: i.origem,
      }),
    );
    return this.indicatorRepository.save(indicators);
  }

  private async saveActionPlan(orgId: string, sessionId: string, data: Array<Record<string, string>>) {
    await this.actionPlanRepository.delete({ organizationId: orgId });
    const actions = data.map((a) =>
      this.actionPlanRepository.create({
        sessionId,
        organizationId: orgId,
        acao: a.acao,
        origem: a.origem,
        responsavel: a.responsavel,
        prazo: a.prazo,
        status: a.status || 'Não iniciado',
      }),
    );
    return this.actionPlanRepository.save(actions);
  }

  private async saveRoutines(orgId: string, sessionId: string, data: Record<string, string>) {
    await this.routineRepository.delete({ organizationId: orgId });
    const routine = this.routineRepository.create({
      sessionId,
      organizationId: orgId,
      ...data,
    });
    return this.routineRepository.save(routine);
  }

  async getCanvas(organizationId: string, userId: string) {
    await this.organizationsService.checkAccess(userId, organizationId);
    const canvas = await this.canvasRepository.findOne({ where: { organizationId } });
    return canvas || {
      segmentos: '',
      proposta: '',
      canais: '',
      relacionamento: '',
      atividades: '',
      recursos: '',
      parceiros: '',
      custos: '',
      receitas: '',
    };
  }

  async updateCanvas(organizationId: string, userId: string, data: Partial<BusinessModelCanvas>) {
    await this.organizationsService.checkAccess(userId, organizationId);
    let canvas = await this.canvasRepository.findOne({ where: { organizationId } });
    if (!canvas) {
      canvas = this.canvasRepository.create({
        organizationId,
        sessionId: uuidv4(),
        ...data,
      });
    } else {
      Object.assign(canvas, data);
    }
    return this.canvasRepository.save(canvas);
  }

  async getEmpathyMap(organizationId: string, userId: string) {
    await this.organizationsService.checkAccess(userId, organizationId);
    const empathy = await this.empathyRepository.findOne({ where: { organizationId } });
    return empathy || {
      oQueVe: '',
      oQueOuve: '',
      oQuePensa: '',
      oQueFala: '',
      dores: '',
      ganhos: '',
    };
  }

  async updateEmpathyMap(organizationId: string, userId: string, data: Partial<EmpathyMap>) {
    await this.organizationsService.checkAccess(userId, organizationId);
    let empathy = await this.empathyRepository.findOne({ where: { organizationId } });
    if (!empathy) {
      empathy = this.empathyRepository.create({
        organizationId,
        sessionId: uuidv4(),
        ...data,
      });
    } else {
      Object.assign(empathy, data);
    }
    return this.empathyRepository.save(empathy);
  }

  async getSwot(organizationId: string, userId: string) {
    await this.organizationsService.checkAccess(userId, organizationId);
    const swot = await this.swotRepository.findOne({ where: { organizationId } });
    return swot || {
      forcas: '',
      fraquezas: '',
      oportunidades: '',
      ameacas: '',
    };
  }

  async updateSwot(organizationId: string, userId: string, data: Partial<SwotAnalysis>) {
    await this.organizationsService.checkAccess(userId, organizationId);
    let swot = await this.swotRepository.findOne({ where: { organizationId } });
    if (!swot) {
      swot = this.swotRepository.create({
        organizationId,
        sessionId: uuidv4(),
        ...data,
      });
    } else {
      Object.assign(swot, data);
    }
    return this.swotRepository.save(swot);
  }

  async getFilosofia(organizationId: string, userId: string) {
    await this.organizationsService.checkAccess(userId, organizationId);
    const filosofia = await this.filosofiaRepository.findOne({ where: { organizationId } });
    return filosofia || {
      missao: '',
      visao: '',
      valores: '',
      proposito: '',
    };
  }

  async updateFilosofia(organizationId: string, userId: string, data: Partial<Filosofia>) {
    await this.organizationsService.checkAccess(userId, organizationId);
    let filosofia = await this.filosofiaRepository.findOne({ where: { organizationId } });
    if (!filosofia) {
      filosofia = this.filosofiaRepository.create({
        organizationId,
        sessionId: uuidv4(),
        ...data,
      });
    } else {
      Object.assign(filosofia, data);
    }
    return this.filosofiaRepository.save(filosofia);
  }

  async getOkrs(organizationId: string, userId: string) {
    await this.organizationsService.checkAccess(userId, organizationId);
    const okrs = await this.okrRepository.find({ where: { organizationId } });
    return okrs.length > 0 ? okrs : [];
  }

  async updateOkr(organizationId: string, userId: string, okrId: string, data: Partial<Okr>) {
    await this.organizationsService.checkAccess(userId, organizationId);
    const okr = await this.okrRepository.findOne({ where: { id: okrId, organizationId } });
    if (!okr) throw new NotFoundException('OKR não encontrado');
    Object.assign(okr, data);
    return this.okrRepository.save(okr);
  }

  async updateAllOkrs(organizationId: string, userId: string, data: Array<{ id?: string; objetivo: string; krs: string }>) {
    await this.organizationsService.checkAccess(userId, organizationId);
    await this.okrRepository.delete({ organizationId });
    const sessionId = uuidv4();
    const okrs = data.map((o) =>
      this.okrRepository.create({
        sessionId,
        organizationId,
        objetivo: o.objetivo,
        krs: o.krs,
      }),
    );
    return this.okrRepository.save(okrs);
  }

  async getIndicators(organizationId: string, userId: string) {
    await this.organizationsService.checkAccess(userId, organizationId);
    const indicators = await this.indicatorRepository.find({ where: { organizationId } });
    return indicators.length > 0 ? indicators : [];
  }

  async updateIndicator(organizationId: string, userId: string, indicatorId: string, data: Partial<Indicator>) {
    await this.organizationsService.checkAccess(userId, organizationId);
    const indicator = await this.indicatorRepository.findOne({ where: { id: indicatorId, organizationId } });
    if (!indicator) throw new NotFoundException('Indicador não encontrado');
    Object.assign(indicator, data);
    return this.indicatorRepository.save(indicator);
  }

  async updateAllIndicators(organizationId: string, userId: string, data: Array<{ id?: string; nome: string; descricao: string; meta: string; origem: string; mensal?: string }>) {
    await this.organizationsService.checkAccess(userId, organizationId);
    await this.indicatorRepository.delete({ organizationId });
    const sessionId = uuidv4();
    const indicators = data.map((i) =>
      this.indicatorRepository.create({
        sessionId,
        organizationId,
        nome: i.nome,
        descricao: i.descricao,
        meta: i.meta,
        origem: i.origem,
        mensal: i.mensal || '',
      }),
    );
    return this.indicatorRepository.save(indicators);
  }

  async getActionPlan(organizationId: string, userId: string) {
    await this.organizationsService.checkAccess(userId, organizationId);
    const actions = await this.actionPlanRepository.find({ where: { organizationId } });
    return actions.length > 0 ? actions : [];
  }

  async updateAction(organizationId: string, userId: string, actionId: string, data: Partial<ActionPlan>) {
    await this.organizationsService.checkAccess(userId, organizationId);
    const action = await this.actionPlanRepository.findOne({ where: { id: actionId, organizationId } });
    if (!action) throw new NotFoundException('Ação não encontrada');
    Object.assign(action, data);
    return this.actionPlanRepository.save(action);
  }

  async updateAllActions(organizationId: string, userId: string, data: Array<{ id?: string; acao: string; origem: string; responsavel: string; prazo: string; status?: string; obs?: string }>) {
    await this.organizationsService.checkAccess(userId, organizationId);
    await this.actionPlanRepository.delete({ organizationId });
    const sessionId = uuidv4();
    const actions = data.map((a) =>
      this.actionPlanRepository.create({
        sessionId,
        organizationId,
        acao: a.acao,
        origem: a.origem,
        responsavel: a.responsavel,
        prazo: a.prazo,
        status: a.status || 'Não iniciado',
        obs: a.obs || '',
      }),
    );
    return this.actionPlanRepository.save(actions);
  }

  async getRoutines(organizationId: string, userId: string) {
    await this.organizationsService.checkAccess(userId, organizationId);
    const routine = await this.routineRepository.findOne({ where: { organizationId } });
    return routine || {
      diaria: '',
      semanal: '',
      mensal: '',
      trimestral: '',
      anual: '',
    };
  }

  async updateRoutines(organizationId: string, userId: string, data: Partial<ManagementRoutine>) {
    await this.organizationsService.checkAccess(userId, organizationId);
    let routine = await this.routineRepository.findOne({ where: { organizationId } });
    if (!routine) {
      routine = this.routineRepository.create({
        organizationId,
        sessionId: uuidv4(),
        ...data,
      });
    } else {
      Object.assign(routine, data);
    }
    return this.routineRepository.save(routine);
  }
}
