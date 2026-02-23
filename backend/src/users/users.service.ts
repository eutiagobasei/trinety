import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../database/entities/user.entity';
import { UserOrganization } from '../database/entities/user-organization.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(UserOrganization)
    private readonly userOrgRepository: Repository<UserOrganization>,
  ) {}

  async findById(id: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['activeOrganization', 'userOrganizations', 'userOrganizations.organization'],
    });

    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { email } });
  }

  async updateProfile(userId: string, data: Partial<User>): Promise<User> {
    await this.userRepository.update(userId, data);
    return this.findById(userId);
  }

  async getUserOrganizations(userId: string) {
    return this.userOrgRepository.find({
      where: { userId },
      relations: ['organization'],
    });
  }

  async getUserRole(userId: string, organizationId: string) {
    const userOrg = await this.userOrgRepository.findOne({
      where: { userId, organizationId },
    });

    return userOrg ? { role: userOrg.role, isOwner: userOrg.isOwner } : null;
  }
}
