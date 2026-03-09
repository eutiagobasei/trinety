import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Plan } from '../../database/entities/plan.entity';
import { PlanFeature } from '../../database/entities/plan-feature.entity';
import { Organization } from '../../database/entities/organization.entity';
import {
  CreatePlanDto,
  UpdatePlanDto,
  CreatePlanFeatureDto,
  UpdatePlanFeatureDto,
} from '../dto/admin-plan.dto';

@Injectable()
export class AdminPlansService {
  constructor(
    @InjectRepository(Plan)
    private planRepo: Repository<Plan>,
    @InjectRepository(PlanFeature)
    private featureRepo: Repository<PlanFeature>,
    @InjectRepository(Organization)
    private organizationRepo: Repository<Organization>,
  ) {}

  async findAll() {
    const plans = await this.planRepo.find({
      relations: ['features'],
      order: { sortOrder: 'ASC' },
    });

    // Add organization count for each plan
    const plansWithCount = await Promise.all(
      plans.map(async (plan) => {
        const organizationsCount = await this.organizationRepo.count({
          where: { planId: plan.id },
        });
        return { ...plan, organizationsCount };
      }),
    );

    return plansWithCount;
  }

  async findById(id: string) {
    const plan = await this.planRepo.findOne({
      where: { id },
      relations: ['features'],
    });

    if (!plan) {
      throw new NotFoundException('Plano não encontrado');
    }

    const organizationsCount = await this.organizationRepo.count({
      where: { planId: id },
    });

    return { ...plan, organizationsCount };
  }

  async findByCode(code: string) {
    return this.planRepo.findOne({
      where: { code },
      relations: ['features'],
    });
  }

  async create(dto: CreatePlanDto) {
    // Check if code already exists
    const existing = await this.planRepo.findOne({ where: { code: dto.code } });
    if (existing) {
      throw new ConflictException(`Plano com código "${dto.code}" já existe`);
    }

    const { features, ...planData } = dto;

    const plan = this.planRepo.create(planData);
    const savedPlan = await this.planRepo.save(plan);

    if (features && features.length > 0) {
      const planFeatures = features.map((f) =>
        this.featureRepo.create({
          ...f,
          planId: savedPlan.id,
        }),
      );
      await this.featureRepo.save(planFeatures);
    }

    return this.findById(savedPlan.id);
  }

  async update(id: string, dto: UpdatePlanDto) {
    const plan = await this.findById(id);

    const { features, ...planData } = dto;

    // Check for code conflict if changing code
    if (dto.code && dto.code !== plan.code) {
      const existing = await this.planRepo.findOne({ where: { code: dto.code } });
      if (existing) {
        throw new ConflictException(`Plano com código "${dto.code}" já existe`);
      }
    }

    Object.assign(plan, planData);
    await this.planRepo.save(plan);

    // Update features if provided
    if (features) {
      // Remove existing features
      await this.featureRepo.delete({ planId: id });

      // Add new features
      if (features.length > 0) {
        const planFeatures = features.map((f) =>
          this.featureRepo.create({
            ...f,
            planId: id,
          }),
        );
        await this.featureRepo.save(planFeatures);
      }
    }

    return this.findById(id);
  }

  async delete(id: string) {
    const plan = await this.findById(id);

    // Check if any organization is using this plan
    const orgsCount = await this.organizationRepo.count({
      where: { planId: id },
    });

    if (orgsCount > 0) {
      // Soft delete - just deactivate
      plan.isActive = false;
      return this.planRepo.save(plan);
    }

    // Hard delete if no organizations using it
    await this.featureRepo.delete({ planId: id });
    await this.planRepo.delete(id);

    return { deleted: true };
  }

  async assignToOrganization(planId: string, organizationId: string) {
    const plan = await this.findById(planId);

    const org = await this.organizationRepo.findOne({
      where: { id: organizationId },
    });

    if (!org) {
      throw new NotFoundException('Organização não encontrada');
    }

    org.planId = plan.id;
    return this.organizationRepo.save(org);
  }

  async getFeatures(planId: string) {
    await this.findById(planId);
    return this.featureRepo.find({ where: { planId } });
  }

  async addFeature(planId: string, dto: CreatePlanFeatureDto) {
    await this.findById(planId);

    const feature = this.featureRepo.create({
      ...dto,
      planId,
    });

    return this.featureRepo.save(feature);
  }

  async updateFeature(planId: string, featureId: string, dto: UpdatePlanFeatureDto) {
    const feature = await this.featureRepo.findOne({
      where: { id: featureId, planId },
    });

    if (!feature) {
      throw new NotFoundException('Feature não encontrada');
    }

    Object.assign(feature, dto);
    return this.featureRepo.save(feature);
  }

  async deleteFeature(planId: string, featureId: string) {
    const feature = await this.featureRepo.findOne({
      where: { id: featureId, planId },
    });

    if (!feature) {
      throw new NotFoundException('Feature não encontrada');
    }

    await this.featureRepo.delete(featureId);
    return { deleted: true };
  }
}
