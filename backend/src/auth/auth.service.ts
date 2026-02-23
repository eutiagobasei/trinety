import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User } from '../database/entities/user.entity';
import { UserOrganization, AppRole } from '../database/entities/user-organization.entity';
import { Organization } from '../database/entities/organization.entity';
import { SignUpDto, SignInDto, AuthResponse } from './dto/auth.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(UserOrganization)
    private readonly userOrgRepository: Repository<UserOrganization>,
    @InjectRepository(Organization)
    private readonly orgRepository: Repository<Organization>,
    private readonly jwtService: JwtService,
  ) {}

  async signUp(dto: SignUpDto): Promise<AuthResponse> {
    const existingUser = await this.userRepository.findOne({
      where: { email: dto.email },
    });

    if (existingUser) {
      throw new ConflictException('Email já está em uso');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const user = this.userRepository.create({
      email: dto.email,
      password: hashedPassword,
      fullName: dto.fullName,
    });

    await this.userRepository.save(user);

    const tokens = await this.generateTokens(user);

    return {
      user: this.sanitizeUser(user),
      ...tokens,
    };
  }

  async signIn(dto: SignInDto): Promise<AuthResponse> {
    const user = await this.userRepository.findOne({
      where: { email: dto.email },
      relations: ['activeOrganization'],
    });

    if (!user) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    const tokens = await this.generateTokens(user);

    return {
      user: this.sanitizeUser(user),
      ...tokens,
    };
  }

  async validateUser(email: string, password: string): Promise<User | null> {
    const user = await this.userRepository.findOne({
      where: { email },
    });

    if (user && (await bcrypt.compare(password, user.password))) {
      return user;
    }

    return null;
  }

  async getProfile(userId: string) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['activeOrganization', 'userOrganizations', 'userOrganizations.organization'],
    });

    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    const currentOrgRole = user.activeOrganizationId
      ? user.userOrganizations.find((uo) => uo.organizationId === user.activeOrganizationId)
      : null;

    return {
      ...this.sanitizeUser(user),
      organizations: user.userOrganizations.map((uo) => ({
        id: uo.organization.id,
        name: uo.organization.name,
        code: uo.organization.code,
        role: uo.role,
        isOwner: uo.isOwner,
      })),
      currentRole: currentOrgRole?.role || null,
      isOwner: currentOrgRole?.isOwner || false,
    };
  }

  async switchOrganization(userId: string, organizationId: string) {
    const userOrg = await this.userOrgRepository.findOne({
      where: { userId, organizationId },
      relations: ['organization'],
    });

    if (!userOrg) {
      throw new NotFoundException('Organização não encontrada ou sem acesso');
    }

    await this.userRepository.update(userId, {
      activeOrganizationId: organizationId,
    });

    return {
      organizationId,
      organizationName: userOrg.organization.name,
      role: userOrg.role,
    };
  }

  async refreshToken(userId: string): Promise<{ accessToken: string }> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new UnauthorizedException('Usuário não encontrado');
    }

    const accessToken = this.jwtService.sign({
      sub: user.id,
      email: user.email,
    });

    return { accessToken };
  }

  private async generateTokens(user: User) {
    const payload = {
      sub: user.id,
      email: user.email,
      isSystemAdmin: user.isSystemAdmin,
    };

    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.jwtService.sign(payload, { expiresIn: '30d' });

    return { accessToken, refreshToken };
  }

  private sanitizeUser(user: User) {
    const { password, ...rest } = user;
    return rest;
  }
}
