import { Controller, Get, UseGuards, Request, Param, Query } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AnalyticsService } from './analytics.service';

@Controller()
@UseGuards(JwtAuthGuard)
export class AnalyticsController {
  constructor(private analyticsService: AnalyticsService) {}

  @Get('analytics/team')
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

  @Get('analytics/url/:urlId')
  async getUrlAnalytics(@Request() req, @Param('urlId') urlId: string) {
    return this.analyticsService.getUrlAnalytics(urlId, req.user.teamId);
  }

  @Get('analytics/user/:userId')
  async getUserAnalytics(@Request() req, @Param('userId') userId: string) {
    return this.analyticsService.getUserAnalytics(userId, req.user.teamId);
  }

  @Get('analytics/countries')
  async getCountryAnalytics(@Request() req) {
    return this.analyticsService.getCountryAnalytics(req.user.teamId);
  }

  @Get('analytics/countries/detailed')
  async getDetailedCountryAnalytics(@Request() req) {
    return this.analyticsService.getDetailedCountryAnalytics(req.user.teamId);
  }

  @Get('analytics/user/countries/detailed')
  async getUserDetailedCountryAnalytics(@Request() req) {
    return this.analyticsService.getUserDetailedCountryAnalytics(req.user.userId, req.user.teamId);
  }

  @Get('analytics/team-members')
  async getTeamMemberClickStats(@Request() req) {
    // Optionally, check if user is admin here
    return this.analyticsService.getTeamMemberClickStats(req.user.teamId);
  }

  // Admin endpoints for team analytics
  @Get('analytics/admin/team-total-clicks-month')
  async getTeamTotalClicksForMonth(
    @Request() req,
    @Query('year') year?: string,
    @Query('month') month?: string,
  ) {
    return this.analyticsService.getTeamTotalClicksForMonth(
      req.user.teamId,
      year ? parseInt(year) : undefined,
      month ? parseInt(month) : undefined,
    );
  }

  @Get('analytics/admin/team-countries')
  async getTeamCountries(@Request() req) {
    return this.analyticsService.getTeamCountries(req.user.teamId);
  }

  @Get('analytics/admin/top-team-countries')
  async getTopTeamCountries(
    @Request() req,
    @Query('limit') limit: string = '10',
  ) {
    return this.analyticsService.getTopTeamCountries(req.user.teamId, parseInt(limit));
  }
} 