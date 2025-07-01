import { Controller, Get, Post, Body, Param, UseGuards, Request } from '@nestjs/common';
import { TeamsService } from './teams.service';
import { CreateTeamDto } from './dto/create-team.dto';
import { UpdateRewardsDto } from './dto/update-rewards.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UrlsService } from '../urls/urls.service';

@Controller()
@UseGuards(JwtAuthGuard)
export class TeamsController {
  constructor(
    private readonly teamsService: TeamsService,
    private readonly urlsService: UrlsService,
  ) {}

  @Post('teams')
  create(@Body() createTeamDto: CreateTeamDto) {
    return this.teamsService.create(createTeamDto);
  }

  @Get('teams/my-team')
  async getMyTeam(@Request() req) {
    const user = req.user;
    return this.teamsService.findOne(user.teamId);
  }

  @Post('teams/:id/rewards')
  @UseGuards(RolesGuard)
  @Roles('admin')
  async updateRewards(
    @Param('id') id: string,
    @Body() updateRewardsDto: UpdateRewardsDto,
    @Request() req
  ) {
    // Ensure admin can only update their own team
    if (req.user.teamId !== id) {
      throw new Error('Unauthorized');
    }
    return this.teamsService.updateRewards(id, updateRewardsDto);
  }

  @Get('teams/my-earnings')
  async getMyEarnings(@Request() req) {
    const user = req.user;
    // Get total clicks for the user
    const totalClicks = await this.getUserTotalClicks(user.userId, user.teamId);
    return this.teamsService.calculateUserEarnings(user.userId, user.teamId, totalClicks);
  }

  private async getUserTotalClicks(userId: string, teamId: string): Promise<number> {
    try {
      const userUrls = await this.urlsService.findAllByUser(userId, teamId, 1, 1000);
      const totalClicks = userUrls.urls.reduce((total, url) => total + url.clicks, 0);
      return totalClicks;
    } catch (error) {
      console.error('Error getting user total clicks:', error);
      return 0;
    }
  }
} 