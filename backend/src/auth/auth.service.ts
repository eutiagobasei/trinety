import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User } from '../database/entities/user.entity';
import { UserOrganization } from '../database/entities/user-organization.entity';
import { Organization } from '../database/entities/organization.entity';
import { SignUpDto, SignInDto, AuthResponse } from './dto/auth.dto';

export interface TokenPayload {
  sub: string;
  email: string;
  isSystemAdmin: boolean;
}

export interface Tokens {
  accessToken: string;
  refreshToken: string;
}

@Injectable()
export class AuthService {
  private readonly accessTokenExpiry: string;
  private readonly refreshTokenExpiry: string;

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(UserOrganization)
    private readonly userOrgRepository: Repository<UserOrganization>,
    @InjectRepository(Organization)
    private readonly orgRepository: Repository<Organization>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {
    this.accessTokenExpiry = this.configService.get('JWT_EXPIRES_IN', '15m');
    this.refreshTokenExpiry = this.configService.get('JWT_REFRESH_EXPIRES_IN', '7d');
  }

  async signUp(dto: SignUpDto): Promise<AuthResponse> {
    const existingUser = await this.userRepository.findOne({
      where: { email: dto.email.toLowerCase().trim() },
    });

    if (existingUser) {
      throw new ConflictException('Email já está em uso');
    }

    // Validate password strength
    this.validatePasswordStrength(dto.password);

    const hashedPassword = await bcrypt.hash(dto.password, 12);

    const user = this.userRepository.create({
      email: dto.email.toLowerCase().trim(),
      password: hashedPassword,
      fullName: dto.fullName?.trim() || '',
    });

    await this.userRepository.save(user);

    const tokens = this.generateTokens(user);

    return {
      user: this.sanitizeUser(user),
      ...tokens,
    };
  }

  async signIn(dto: SignInDto): Promise<AuthResponse> {
    const user = await this.userRepository.findOne({
      where: { email: dto.email.toLowerCase().trim() },
      relations: ['activeOrganization'],
    });

    if (!user) {
      // Use constant-time comparison to prevent timing attacks
      await bcrypt.compare(dto.password, '$2a$12$invalid.hash.for.timing.attack.prevention');
      throw new UnauthorizedException('Credenciais inválidas');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    const tokens = this.generateTokens(user);

    return {
      user: this.sanitizeUser(user),
      ...tokens,
    };
  }

  async validateUser(email: string, password: string): Promise<User | null> {
    const user = await this.userRepository.findOne({
      where: { email: email.toLowerCase().trim() },
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

  async refreshToken(userId: string): Promise<Tokens> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new UnauthorizedException('Usuário não encontrado');
    }

    return this.generateTokens(user);
  }

  generateTokens(user: User): Tokens {
    const payload: TokenPayload = {
      sub: user.id,
      email: user.email,
      isSystemAdmin: user.isSystemAdmin,
    };

    const accessToken = this.jwtService.sign(payload as any, {
      expiresIn: this.accessTokenExpiry as any,
    });

    const refreshToken = this.jwtService.sign(payload as any, {
      expiresIn: this.refreshTokenExpiry as any,
    });

    return { accessToken, refreshToken };
  }

  private validatePasswordStrength(password: string): void {
    if (password.length < 8) {
      throw new ConflictException('Senha deve ter pelo menos 8 caracteres');
    }

    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);

    if (!hasUppercase || !hasLowercase || !hasNumber) {
      throw new ConflictException(
        'Senha deve conter pelo menos uma letra maiúscula, uma minúscula e um número',
      );
    }
  }

  private sanitizeUser(user: User) {
    const { password, ...rest } = user;
    return rest;
  }
}
