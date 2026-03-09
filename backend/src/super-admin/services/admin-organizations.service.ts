import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, FindOptionsWhere } from 'typeorm';
import { Organization } from '../../database/entities/organization.entity';
import { UserOrganization } from '../../database/entities/user-organization.entity';
import { User } from '../../database/entities/user.entity';
import {
  AdminCreateOrganizationDto,
  AdminUpdateOrganizationDto,
  AdminOrganizationQueryDto,
} from '../dto/admin-organization.dto';

@Injectable()
export class AdminOrganizationsService {
  constructor(
    @InjectRepository(Organization)
    private organizationRepo: Repository<Organization>,
    @InjectRepository(UserOrganization)
    private userOrgRepo: Repository<UserOrganization>,
    @InjectRepository(User)
    private userRepo: Repository<User>,
  ) {}

  async findAll(query: AdminOrganizationQueryDto) {
    const { page = 1, limit = 20, isActive, search, planId } = query;
    const skip = (page - 1) * limit;

    const where: FindOptionsWhere<Organization> = {};

    if (typeof isActive === 'boolean') {
      where.isActive = isActive;
    }

    if (planId) {
      where.planId = planId;
    }

    const queryBuilder = this.organizationRepo
      .createQueryBuilder('org')
      .leftJoinAndSelect('org.plan', 'plan')
      .loadRelationCountAndMap('org.usersCount', 'org.userOrganizations');

    if (typeof isActive === 'boolean') {
      queryBuilder.andWhere('org.isActive = :isActive', { isActive });
    }

    if (planId) {
      queryBuilder.andWhere('org.planId = :planId', { planId });
    }

    if (search) {
      queryBuilder.andWhere(
        '(org.name ILIKE :search OR org.code ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    queryBuilder.orderBy('org.createdAt', 'DESC').skip(skip).take(limit);

    const [data, total] = await queryBuilder.getManyAndCount();

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findById(id: string) {
    const org = await this.organizationRepo.findOne({
      where: { id },
      relations: ['plan', 'plan.features'],
    });

    if (!org) {
      throw new NotFoundException('Organização não encontrada');
    }

    const usersCount = await this.userOrgRepo.count({
      where: { organizationId: id },
    });

    return { ...org, usersCount };
  }

  async create(dto: AdminCreateOrganizationDto) {
    const org = this.organizationRepo.create(dto);
    return this.organizationRepo.save(org);
  }

  async update(id: string, dto: AdminUpdateOrganizationDto) {
    const org = await this.findById(id);
    Object.assign(org, dto);
    return this.organizationRepo.save(org);
  }

  async activate(id: string) {
    const org = await this.findById(id);
    org.isActive = true;
    org.deactivatedAt = null as any;
    return this.organizationRepo.save(org);
  }

  async deactivate(id: string) {
    const org = await this.findById(id);
    org.isActive = false;
    org.deactivatedAt = new Date();
    return this.organizationRepo.save(org);
  }

  async getUsers(id: string) {
    await this.findById(id); // Verify org exists

    const userOrgs = await this.userOrgRepo.find({
      where: { organizationId: id },
      relations: ['user'],
    });

    return userOrgs.map((uo) => ({
      id: uo.user.id,
      name: uo.user.fullName,
      email: uo.user.email,
      role: uo.role,
      isOwner: uo.isOwner,
      joinedAt: uo.createdAt,
    }));
  }

  async delete(id: string) {
    const org = await this.findById(id);
    // Soft delete by deactivating
    org.isActive = false;
    org.deactivatedAt = new Date();
    return this.organizationRepo.save(org);
  }

  async getStats() {
    const total = await this.organizationRepo.count();
    const active = await this.organizationRepo.count({ where: { isActive: true } });
    const inactive = await this.organizationRepo.count({ where: { isActive: false } });

    const byPlan = await this.organizationRepo
      .createQueryBuilder('org')
      .leftJoin('org.plan', 'plan')
      .select('plan.name', 'planName')
      .addSelect('COUNT(org.id)', 'count')
      .groupBy('plan.name')
      .getRawMany();

    return {
      total,
      active,
      inactive,
      byPlan,
    };
  }
}
