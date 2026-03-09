import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan } from 'typeorm';
import { Organization } from '../../database/entities/organization.entity';
import { User } from '../../database/entities/user.entity';
import { Plan } from '../../database/entities/plan.entity';
import { ApiUsageLog } from '../../database/entities/api-usage-log.entity';

@Injectable()
export class AdminDashboardService {
  constructor(
    @InjectRepository(Organization)
    private organizationRepo: Repository<Organization>,
    @InjectRepository(User)
    private userRepo: Repository<User>,
    @InjectRepository(Plan)
    private planRepo: Repository<Plan>,
    @InjectRepository(ApiUsageLog)
    private usageLogRepo: Repository<ApiUsageLog>,
  ) {}

  async getOverview() {
    const [
      totalOrganizations,
      activeOrganizations,
      totalUsers,
      totalPlans,
    ] = await Promise.all([
      this.organizationRepo.count(),
      this.organizationRepo.count({ where: { isActive: true } }),
      this.userRepo.count(),
      this.planRepo.count({ where: { isActive: true } }),
    ]);

    // Organizations by plan
    const organizationsByPlan = await this.organizationRepo
      .createQueryBuilder('org')
      .leftJoin('org.plan', 'plan')
      .select('COALESCE(plan.name, \'Sem plano\')', 'planName')
      .addSelect('COUNT(org.id)', 'count')
      .groupBy('plan.name')
      .getRawMany();

    return {
      totalOrganizations,
      activeOrganizations,
      inactiveOrganizations: totalOrganizations - activeOrganizations,
      totalUsers,
      totalPlans,
      organizationsByPlan,
    };
  }

  async getRecentActivity(limit: number = 10) {
    // Recent organizations
    const recentOrganizations = await this.organizationRepo.find({
      order: { createdAt: 'DESC' },
      take: limit,
      select: ['id', 'name', 'code', 'createdAt'],
    });

    // Recent users
    const recentUsers = await this.userRepo.find({
      order: { createdAt: 'DESC' },
      take: limit,
      select: ['id', 'fullName', 'email', 'createdAt'],
    });

    return {
      recentOrganizations,
      recentUsers,
    };
  }

  async getApiUsageOverview(days: number = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Usage by provider
    const usageByProvider = await this.usageLogRepo
      .createQueryBuilder('log')
      .select('log.provider', 'provider')
      .addSelect('COUNT(*)', 'totalCalls')
      .addSelect('SUM(log.totalTokens)', 'totalTokens')
      .addSelect('SUM(log.cost)', 'totalCost')
      .addSelect('AVG(log.responseTimeMs)', 'avgResponseTime')
      .where('log.createdAt >= :startDate', { startDate })
      .groupBy('log.provider')
      .getRawMany();

    // Daily usage trend
    const dailyUsage = await this.usageLogRepo
      .createQueryBuilder('log')
      .select('DATE(log.createdAt)', 'date')
      .addSelect('COUNT(*)', 'calls')
      .addSelect('SUM(log.cost)', 'cost')
      .where('log.createdAt >= :startDate', { startDate })
      .groupBy('DATE(log.createdAt)')
      .orderBy('date', 'ASC')
      .getRawMany();

    // Error rate
    const errorStats = await this.usageLogRepo
      .createQueryBuilder('log')
      .select('COUNT(*)', 'total')
      .addSelect('SUM(CASE WHEN NOT log.success THEN 1 ELSE 0 END)', 'errors')
      .where('log.createdAt >= :startDate', { startDate })
      .getRawOne();

    const errorRate = errorStats.total > 0
      ? (errorStats.errors / errorStats.total * 100).toFixed(2)
      : 0;

    return {
      usageByProvider,
      dailyUsage,
      errorRate: parseFloat(errorRate as string),
      totalCalls: parseInt(errorStats.total) || 0,
      totalErrors: parseInt(errorStats.errors) || 0,
    };
  }

  async getOrganizationGrowth(days: number = 90) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Organization creation trend
    const growth = await this.organizationRepo
      .createQueryBuilder('org')
      .select('DATE(org.createdAt)', 'date')
      .addSelect('COUNT(*)', 'count')
      .where('org.createdAt >= :startDate', { startDate })
      .groupBy('DATE(org.createdAt)')
      .orderBy('date', 'ASC')
      .getRawMany();

    // Cumulative count
    let cumulative = 0;
    const cumulativeGrowth = growth.map((item) => {
      cumulative += parseInt(item.count);
      return {
        date: item.date,
        newOrganizations: parseInt(item.count),
        totalOrganizations: cumulative,
      };
    });

    return cumulativeGrowth;
  }

  async getTopOrganizationsByUsage(limit: number = 10) {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    return this.usageLogRepo
      .createQueryBuilder('log')
      .leftJoin('log.organization', 'org')
      .select('org.id', 'organizationId')
      .addSelect('org.name', 'organizationName')
      .addSelect('COUNT(*)', 'totalCalls')
      .addSelect('SUM(log.cost)', 'totalCost')
      .where('log.createdAt >= :startDate', { startDate: thirtyDaysAgo })
      .andWhere('log.organizationId IS NOT NULL')
      .groupBy('org.id')
      .addGroupBy('org.name')
      .orderBy('totalCost', 'DESC')
      .limit(limit)
      .getRawMany();
  }
}
