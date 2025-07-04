import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Team, TeamDocument } from './schemas/team.schema';
import { CreateTeamDto } from './dto/create-team.dto';
import { UpdateRewardsDto } from './dto/update-rewards.dto';

@Injectable()
export class TeamsService {
  constructor(
    @InjectModel(Team.name) private teamModel: Model<TeamDocument>,
  ) {}

  async create(createTeamDto: CreateTeamDto): Promise<Team> {
    const team = new this.teamModel(createTeamDto);
    return team.save();
  }

  async findOne(id: string): Promise<Team> {
    const team = await this.teamModel.findById(id);
    if (!team) {
      throw new NotFoundException('Team not found');
    }
    return team;
  }

  async updateRewards(teamId: string, updateRewardsDto: UpdateRewardsDto): Promise<Team> {
    const team = await this.teamModel.findByIdAndUpdate(
      teamId,
      { rewards: updateRewardsDto.rewards },
      { new: true }
    );
    
    if (!team) {
      throw new NotFoundException('Team not found');
    }
    
    return team;
  }

  async calculateUserEarnings(userId: string, teamId: string, totalClicks: number): Promise<{
    totalEarnings: number;
    currency: string;
    breakdown: Array<{ clicks: number; amount: number; currency: string; }>;
  }> {
    const team = await this.findOne(teamId);
    
    if (!team.rewards || team.rewards.length === 0) {
      return { totalEarnings: 0, currency: 'PKR', breakdown: [] };
    }

    // Use the first (and only) reward tier
    const reward = team.rewards[0];
    if (!reward) {
      return { totalEarnings: 0, currency: 'PKR', breakdown: [] };
    }
    
    // Calculate earnings for every click, not just when threshold is met
    // Formula: (totalClicks * rewardAmount) / threshold
    const earningsPerClick = reward.amount / reward.clicks;
    const totalEarnings = totalClicks * earningsPerClick;
    
    const breakdown = [{
      clicks: totalClicks,
      amount: totalEarnings,
      currency: reward.currency
    }];
    
    return {
      totalEarnings: Math.round(totalEarnings * 100) / 100, // Round to 2 decimal places
      currency: reward.currency,
      breakdown
    };
  }

  async updateStats(teamId: string, urlCount: number, totalClicks: number): Promise<void> {
    await this.teamModel.findByIdAndUpdate(teamId, {
      urlCount,
      totalClicks,
    });
  }
} 