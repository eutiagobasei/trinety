import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { OrganizationsService } from './organizations.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateOrganizationDto, InviteUserDto, UpdateMemberRoleDto } from './dto/organization.dto';

@Controller('organizations')
@UseGuards(JwtAuthGuard)
export class OrganizationsController {
  constructor(private readonly organizationsService: OrganizationsService) {}

  @Post()
  async create(@Body() dto: CreateOrganizationDto, @Request() req) {
    return this.organizationsService.create(dto, req.user.userId);
  }

  @Get(':id')
  async findById(@Param('id') id: string, @Request() req) {
    await this.organizationsService.checkAccess(req.user.userId, id);
    return this.organizationsService.findById(id);
  }

  @Get(':id/members')
  async getMembers(@Param('id') id: string, @Request() req) {
    return this.organizationsService.getMembers(id, req.user.userId);
  }

  @Post(':id/members')
  async inviteUser(
    @Param('id') id: string,
    @Body() dto: InviteUserDto,
    @Request() req,
  ) {
    return this.organizationsService.inviteUser(dto, id, req.user.userId);
  }

  @Put(':id/members/:memberId/role')
  async updateMemberRole(
    @Param('id') id: string,
    @Param('memberId') memberId: string,
    @Body() dto: UpdateMemberRoleDto,
    @Request() req,
  ) {
    return this.organizationsService.updateMemberRole(id, memberId, dto, req.user.userId);
  }

  @Delete(':id/members/:memberId')
  async removeMember(
    @Param('id') id: string,
    @Param('memberId') memberId: string,
    @Request() req,
  ) {
    return this.organizationsService.removeMember(id, memberId, req.user.userId);
  }
}
