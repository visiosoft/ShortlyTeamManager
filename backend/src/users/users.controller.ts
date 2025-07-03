import { Controller, Get, UseGuards, Request, Param, Delete, Patch, Body, ForbiddenException } from '@nestjs/common';
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

  @Delete('users/:id')
  async deleteUser(@Param('id') id: string, @Request() req) {
    const user = await this.usersService.findById(id);
    // Allow: Admins can delete any user; users can delete themselves
    if (req.user.role !== 'admin' && req.user.userId !== id) {
      throw new ForbiddenException('You do not have permission to delete this user');
    }
    await this.usersService.deleteUser(id);
    return { message: 'User deleted successfully' };
  }

  @Patch('users/:id')
  async updateUser(@Param('id') id: string, @Body() update: any, @Request() req) {
    const user = await this.usersService.findById(id);
    // Allow: Admins can update any user; users can update themselves
    if (req.user.role !== 'admin' && req.user.userId !== id) {
      throw new ForbiddenException('You do not have permission to update this user');
    }
    const updated = await this.usersService.updateUser(id, update);
    return updated;
  }
} 