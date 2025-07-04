import { Controller, Get, Post, Body, Param, UseGuards, Request, Query } from '@nestjs/common';
import { TeamsService } from './teams.service';
import { CreateTeamDto } from './dto/create-team.dto';
import { UpdateRewardsDto } from './dto/update-rewards.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UrlsService } from '../urls/urls.service';
import { AnalyticsService } from '../analytics/analytics.service';

@Controller()
@UseGuards(JwtAuthGuard)
export class TeamsController {
  constructor(
    private readonly teamsService: TeamsService,
    private readonly urlsService: UrlsService,
    private readonly analyticsService: AnalyticsService,
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
  async getMyEarnings(
    @Request() req,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const user = req.user;
    debugger;

    // Get total clicks from analytics data with date filtering
    const totalClicks = await this.getUserTotalClicksFromAnalytics(
      user.userId, 
      user.teamId, 
      startDate, 
      endDate
    );
    console.log(`User ${user.userId} has ${totalClicks} clicks in date range: ${startDate} to ${endDate}`);
    
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

  private async getUserTotalClicksFromAnalytics(
    userId: string, 
    teamId: string, 
    startDate?: string, 
    endDate?: string
  ): Promise<number> {
    try {
      const analytics = await this.analyticsService.getUserAnalytics(userId, teamId, startDate, endDate);
      return analytics.length;
    } catch (error) {
      console.error('Error getting user total clicks from analytics:', error);
      return 0;
    }
  }
} 