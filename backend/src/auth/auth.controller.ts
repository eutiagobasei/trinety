import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  Request,
  Response,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { Response as ExpressResponse, Request as ExpressRequest } from 'express';
import { AuthService } from './auth.service';
import { SignUpDto, SignInDto, SwitchOrganizationDto } from './dto/auth.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
};

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // Strict rate limiting for signup: 5 requests per 15 minutes
  @Post('signup')
  @Throttle({ default: { limit: 5, ttl: 900000 } })
  async signUp(
    @Body() dto: SignUpDto,
    @Response({ passthrough: true }) res: ExpressResponse,
  ) {
    const result = await this.authService.signUp(dto);

    // Set httpOnly cookies for enhanced security
    res.cookie('accessToken', result.accessToken, {
      ...COOKIE_OPTIONS,
      maxAge: 15 * 60 * 1000, // 15 minutes
    });

    res.cookie('refreshToken', result.refreshToken, {
      ...COOKIE_OPTIONS,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    // Still return tokens in response for backward compatibility
    return result;
  }

  // Strict rate limiting for signin: 10 requests per 15 minutes
  @Post('signin')
  @Throttle({ default: { limit: 10, ttl: 900000 } })
  @HttpCode(HttpStatus.OK)
  async signIn(
    @Body() dto: SignInDto,
    @Response({ passthrough: true }) res: ExpressResponse,
  ) {
    const result = await this.authService.signIn(dto);

    // Set httpOnly cookies for enhanced security
    res.cookie('accessToken', result.accessToken, {
      ...COOKIE_OPTIONS,
      maxAge: 15 * 60 * 1000, // 15 minutes
    });

    res.cookie('refreshToken', result.refreshToken, {
      ...COOKIE_OPTIONS,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    // Still return tokens in response for backward compatibility
    return result;
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async getProfile(@Request() req: ExpressRequest & { user: { userId: string } }) {
    return this.authService.getProfile(req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('switch-organization')
  @HttpCode(HttpStatus.OK)
  async switchOrganization(
    @Request() req: ExpressRequest & { user: { userId: string } },
    @Body() dto: SwitchOrganizationDto,
  ) {
    return this.authService.switchOrganization(req.user.userId, dto.organizationId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refreshToken(
    @Request() req: ExpressRequest & { user: { userId: string } },
    @Response({ passthrough: true }) res: ExpressResponse,
  ) {
    const tokens = await this.authService.refreshToken(req.user.userId);

    // Update cookies
    res.cookie('accessToken', tokens.accessToken, {
      ...COOKIE_OPTIONS,
      maxAge: 15 * 60 * 1000,
    });

    res.cookie('refreshToken', tokens.refreshToken, {
      ...COOKIE_OPTIONS,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return tokens;
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(@Response({ passthrough: true }) res: ExpressResponse) {
    // Clear cookies
    res.clearCookie('accessToken', { path: '/' });
    res.clearCookie('refreshToken', { path: '/' });

    return { message: 'Logged out successfully' };
  }
}
