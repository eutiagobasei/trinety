import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Diagnostic } from '../database/entities/diagnostic.entity';
import { DiagnosticAnswer } from '../database/entities/diagnostic-answer.entity';
import { OrganizationsService } from '../organizations/organizations.service';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class DiagnosticService {
  constructor(
    @InjectRepository(Diagnostic)
    private readonly diagnosticRepository: Repository<Diagnostic>,
    @InjectRepository(DiagnosticAnswer)
    private readonly answerRepository: Repository<DiagnosticAnswer>,
    private readonly organizationsService: OrganizationsService,
  ) {}

  async getOrCreateDiagnostic(organizationId: string, userId: string) {
    await this.organizationsService.checkAccess(userId, organizationId);

    let diagnostic = await this.diagnosticRepository.findOne({
      where: { organizationId },
      relations: ['answers'],
    });

    if (!diagnostic) {
      diagnostic = this.diagnosticRepository.create({
        sessionId: uuidv4(),
        organizationId,
        completed: false,
      });
      await this.diagnosticRepository.save(diagnostic);
    }

    return diagnostic;
  }

  async saveAnswer(
    organizationId: string,
    userId: string,
    blockIndex: number,
    questionIndex: number,
    answer: string,
  ) {
    await this.organizationsService.checkAccess(userId, organizationId);

    const diagnostic = await this.getOrCreateDiagnostic(organizationId, userId);

    let existingAnswer = await this.answerRepository.findOne({
      where: {
        diagnosticId: diagnostic.id,
        blockIndex,
        questionIndex,
      },
    });

    if (existingAnswer) {
      existingAnswer.answer = answer;
      return this.answerRepository.save(existingAnswer);
    }

    const newAnswer = this.answerRepository.create({
      diagnosticId: diagnostic.id,
      organizationId,
      blockIndex,
      questionIndex,
      answer,
    });

    return this.answerRepository.save(newAnswer);
  }

  async getAnswers(organizationId: string, userId: string) {
    await this.organizationsService.checkAccess(userId, organizationId);

    const diagnostic = await this.diagnosticRepository.findOne({
      where: { organizationId },
      relations: ['answers'],
    });

    if (!diagnostic) {
      return { diagnostic: null, answers: [] };
    }

    return {
      diagnostic: {
        id: diagnostic.id,
        sessionId: diagnostic.sessionId,
        completed: diagnostic.completed,
      },
      answers: diagnostic.answers,
    };
  }

  async completeDiagnostic(organizationId: string, userId: string) {
    await this.organizationsService.checkAccess(userId, organizationId);

    const diagnostic = await this.diagnosticRepository.findOne({
      where: { organizationId },
    });

    if (!diagnostic) {
      throw new NotFoundException('Diagnóstico não encontrado');
    }

    diagnostic.completed = true;
    return this.diagnosticRepository.save(diagnostic);
  }

  async resetDiagnostic(organizationId: string, userId: string) {
    await this.organizationsService.checkAccess(userId, organizationId);

    const diagnostic = await this.diagnosticRepository.findOne({
      where: { organizationId },
    });

    if (diagnostic) {
      await this.answerRepository.delete({ diagnosticId: diagnostic.id });
      diagnostic.completed = false;
      diagnostic.sessionId = uuidv4();
      return this.diagnosticRepository.save(diagnostic);
    }

    return null;
  }
}
