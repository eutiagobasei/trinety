import {
  Controller,
  Get,
  Put,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  async getMe(@Request() req) {
    const user = await this.usersService.findById(req.user.userId);
    const { password, ...rest } = user;
    return rest;
  }

  @Put('profile')
  async updateProfile(@Request() req, @Body() dto: UpdateProfileDto) {
    const user = await this.usersService.updateProfile(req.user.userId, dto);
    const { password, ...rest } = user;
    return rest;
  }

  @Get('organizations')
  async getMyOrganizations(@Request() req) {
    return this.usersService.getUserOrganizations(req.user.userId);
  }
}
