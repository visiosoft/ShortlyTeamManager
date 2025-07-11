import { Controller, Get, Post, Body, Param, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ReferralsService } from './referrals.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('referrals')
@Controller()
export class ReferralsController {
  constructor(private readonly referralsService: ReferralsService) {}

  @Get('referrals/team-stats')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get team referral statistics' })
  @ApiResponse({
    status: 200,
    description: 'Team referral stats retrieved successfully',
  })
  async getTeamReferralStats(@Request() req) {
    return this.referralsService.getReferralStats(req.user.teamId);
  }

  @Get('referrals/user-stats')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get user referral statistics' })
  @ApiResponse({
    status: 200,
    description: 'User referral stats retrieved successfully',
  })
  async getUserReferralStats(@Request() req) {
    return this.referralsService.getUserReferralStats(req.user.userId);
  }

  @Get('referrals/history')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get referral history for team' })
  @ApiResponse({
    status: 200,
    description: 'Referral history retrieved successfully',
  })
  async getReferralHistory(@Request() req) {
    return this.referralsService.getReferralHistory(req.user.teamId);
  }

  @Get('referrals/my-signups')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get user referral signups' })
  @ApiResponse({
    status: 200,
    description: 'User referral signups retrieved successfully',
  })
  async getUserReferralSignups(@Request() req) {
    return this.referralsService.getUserReferralSignups(req.user.userId);
  }

  @Get('referrals/link')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get user referral link' })
  @ApiResponse({
    status: 200,
    description: 'Referral link generated successfully',
  })
  async getReferralLink(@Request() req) {
    return {
      referralLink: await this.referralsService.getUserReferralLink(req.user.userId),
      referralCode: await this.referralsService.getUserReferralCode(req.user.userId),
    };
  }

  @Post('referrals/validate')
  @ApiOperation({ summary: 'Validate a referral code' })
  @ApiResponse({
    status: 200,
    description: 'Referral code is valid',
  })
  @ApiResponse({
    status: 404,
    description: 'Invalid referral code',
  })
  async validateReferralCode(@Body() body: { referralCode: string }) {
    const result = await this.referralsService.validateReferralCode(body.referralCode);
    
    if (result.valid) {
      if (result.user) {
        return {
          valid: true,
          message: 'Valid user referral code',
          user: {
            firstName: result.user.firstName,
            lastName: result.user.lastName,
            email: result.user.email
          }
        };
      } else if (result.team) {
        return {
          valid: true,
          message: 'Valid team referral code',
          teamName: result.team.name,
          teamDescription: result.team.description,
        };
      }
    }
    
    return {
      valid: false,
      message: 'Invalid referral code',
    };
  }
} 