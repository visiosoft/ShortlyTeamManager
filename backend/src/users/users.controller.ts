import { Controller, Get, UseGuards, Request, Param } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UsersService } from './users.service';

@Controller()
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get('users/profile')
  async getProfile(@Request() req) {
    return this.usersService.findById(req.user.userId);
  }

  @Get('users/team-members')
  async getTeamMembers(@Request() req) {
    return this.usersService.findByTeamId(req.user.teamId);
  }
} 