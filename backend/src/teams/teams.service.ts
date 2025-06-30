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

    let totalEarnings = 0;
    const breakdown: Array<{ clicks: number; amount: number; currency: string; }> = [];
    
    // Sort rewards by clicks in descending order
    const sortedRewards = [...team.rewards].sort((a, b) => b.clicks - a.clicks);
    
    let remainingClicks = totalClicks;
    
    for (const reward of sortedRewards) {
      if (remainingClicks >= reward.clicks) {
        const rewardCount = Math.floor(remainingClicks / reward.clicks);
        const earnedAmount = rewardCount * reward.amount;
        
        breakdown.push({
          clicks: reward.clicks * rewardCount,
          amount: earnedAmount,
          currency: reward.currency
        });
        
        totalEarnings += earnedAmount;
        remainingClicks = remainingClicks % reward.clicks;
      }
    }
    
    return {
      totalEarnings,
      currency: team.rewards[0]?.currency || 'PKR',
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