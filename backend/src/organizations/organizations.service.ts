import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Organization } from '../database/entities/organization.entity';
import { UserOrganization, AppRole } from '../database/entities/user-organization.entity';
import { User } from '../database/entities/user.entity';
import { CreateOrganizationDto, InviteUserDto, UpdateMemberRoleDto } from './dto/organization.dto';

@Injectable()
export class OrganizationsService {
  constructor(
    @InjectRepository(Organization)
    private readonly orgRepository: Repository<Organization>,
    @InjectRepository(UserOrganization)
    private readonly userOrgRepository: Repository<UserOrganization>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(dto: CreateOrganizationDto, userId: string): Promise<Organization> {
    const organization = this.orgRepository.create({
      name: dto.name,
    });

    await this.orgRepository.save(organization);

    const userOrg = this.userOrgRepository.create({
      userId,
      organizationId: organization.id,
      role: AppRole.ADMIN,
      isOwner: true,
    });

    await this.userOrgRepository.save(userOrg);

    await this.userRepository.update(userId, {
      activeOrganizationId: organization.id,
    });

    return organization;
  }

  async findById(id: string): Promise<Organization> {
    const org = await this.orgRepository.findOne({ where: { id } });

    if (!org) {
      throw new NotFoundException('Organização não encontrada');
    }

    return org;
  }

  async findByCode(code: string): Promise<Organization> {
    const org = await this.orgRepository.findOne({ where: { code } });

    if (!org) {
      throw new NotFoundException('Organização não encontrada');
    }

    return org;
  }

  async getMembers(organizationId: string, userId: string) {
    await this.checkAccess(userId, organizationId);

    const members = await this.userOrgRepository.find({
      where: { organizationId },
      relations: ['user'],
    });

    return members.map((m) => ({
      id: m.user.id,
      email: m.user.email,
      fullName: m.user.fullName,
      role: m.role,
      isOwner: m.isOwner,
      joinedAt: m.createdAt,
    }));
  }

  async inviteUser(dto: InviteUserDto, organizationId: string, inviterId: string) {
    const inviterRole = await this.getUserRole(inviterId, organizationId);

    if (inviterRole?.role !== AppRole.ADMIN) {
      throw new ForbiddenException('Apenas administradores podem convidar membros');
    }

    const user = await this.userRepository.findOne({ where: { email: dto.email } });

    if (!user) {
      throw new NotFoundException('Usuário não encontrado. O usuário precisa criar uma conta primeiro.');
    }

    const existingMembership = await this.userOrgRepository.findOne({
      where: { userId: user.id, organizationId },
    });

    if (existingMembership) {
      throw new ConflictException('Usuário já é membro desta organização');
    }

    const userOrg = this.userOrgRepository.create({
      userId: user.id,
      organizationId,
      role: dto.role || AppRole.USUARIO,
      isOwner: false,
    });

    await this.userOrgRepository.save(userOrg);

    return {
      message: 'Usuário adicionado à organização',
      userId: user.id,
      role: userOrg.role,
    };
  }

  async updateMemberRole(
    organizationId: string,
    memberId: string,
    dto: UpdateMemberRoleDto,
    requesterId: string,
  ) {
    const requesterRole = await this.getUserRole(requesterId, organizationId);

    if (requesterRole?.role !== AppRole.ADMIN) {
      throw new ForbiddenException('Apenas administradores podem alterar papéis');
    }

    const memberOrg = await this.userOrgRepository.findOne({
      where: { userId: memberId, organizationId },
    });

    if (!memberOrg) {
      throw new NotFoundException('Membro não encontrado na organização');
    }

    if (memberOrg.isOwner) {
      throw new ForbiddenException('Não é possível alterar o papel do proprietário');
    }

    memberOrg.role = dto.role;
    await this.userOrgRepository.save(memberOrg);

    return { message: 'Papel atualizado', role: dto.role };
  }

  async removeMember(organizationId: string, memberId: string, requesterId: string) {
    const requesterRole = await this.getUserRole(requesterId, organizationId);

    if (requesterRole?.role !== AppRole.ADMIN) {
      throw new ForbiddenException('Apenas administradores podem remover membros');
    }

    const memberOrg = await this.userOrgRepository.findOne({
      where: { userId: memberId, organizationId },
    });

    if (!memberOrg) {
      throw new NotFoundException('Membro não encontrado na organização');
    }

    if (memberOrg.isOwner) {
      throw new ForbiddenException('Não é possível remover o proprietário');
    }

    await this.userOrgRepository.remove(memberOrg);

    return { message: 'Membro removido' };
  }

  async getUserRole(userId: string, organizationId: string) {
    return this.userOrgRepository.findOne({
      where: { userId, organizationId },
    });
  }

  async checkAccess(userId: string, organizationId: string): Promise<UserOrganization> {
    const userOrg = await this.getUserRole(userId, organizationId);

    if (!userOrg) {
      throw new ForbiddenException('Sem acesso a esta organização');
    }

    return userOrg;
  }
}
