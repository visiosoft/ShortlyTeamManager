import { Controller, Get, UseGuards, Request, Param, Query } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AnalyticsService } from './analytics.service';

@Controller('analytics')
@UseGuards(JwtAuthGuard)
export class AnalyticsController {
  constructor(private analyticsService: AnalyticsService) {}

  @Get('team')
  async getTeamAnalytics(
    @Request() req,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '50',
  ) {
    return this.analyticsService.getTeamAnalytics(
      req.user.teamId,
      parseInt(page),
      parseInt(limit),
    );
  }

  @Get('url/:urlId')
  async getUrlAnalytics(@Request() req, @Param('urlId') urlId: string) {
    return this.analyticsService.getUrlAnalytics(urlId, req.user.teamId);
  }

  @Get('user/:userId')
  async getUserAnalytics(@Request() req, @Param('userId') userId: string) {
    return this.analyticsService.getUserAnalytics(userId, req.user.teamId);
  }
} 