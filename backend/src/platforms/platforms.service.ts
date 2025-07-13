import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Platform, PlatformDocument } from './schemas/platform.schema';
import { PlatformClick, PlatformClickDocument } from './schemas/platform-click.schema';
import { User, UserDocument } from '../users/schemas/user.schema';
import { Team, TeamDocument } from '../teams/schemas/team.schema';
import { CreatePlatformDto } from './dto/create-platform.dto';
import { AddPlatformClicksDto } from './dto/add-platform-clicks.dto';

@Injectable()
export class PlatformsService {
  constructor(
    @InjectModel(Platform.name) private platformModel: Model<PlatformDocument>,
    @InjectModel(PlatformClick.name) private platformClickModel: Model<PlatformClickDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Team.name) private teamModel: Model<TeamDocument>,
  ) {}

  // Platform Management
  async createPlatform(createPlatformDto: CreatePlatformDto): Promise<Platform> {
    const existingPlatform = await this.platformModel.findOne({ 
      name: createPlatformDto.name 
    });
    
    if (existingPlatform) {
      throw new ConflictException('Platform with this name already exists');
    }

    const platform = new this.platformModel(createPlatformDto);
    return await platform.save();
  }

  async getAllPlatforms(): Promise<Platform[]> {
    return await this.platformModel.find().sort({ name: 1 });
  }

  async getActivePlatforms(): Promise<Platform[]> {
    return await this.platformModel.find({ isActive: true }).sort({ name: 1 });
  }

  async getPlatformById(id: string): Promise<Platform> {
    const platform = await this.platformModel.findById(id);
    if (!platform) {
      throw new NotFoundException('Platform not found');
    }
    return platform;
  }

  async updatePlatform(id: string, updateData: Partial<CreatePlatformDto>): Promise<Platform> {
    const platform = await this.platformModel.findByIdAndUpdate(
      id, 
      updateData, 
      { new: true }
    );
    
    if (!platform) {
      throw new NotFoundException('Platform not found');
    }
    
    return platform;
  }

  async deletePlatform(id: string): Promise<void> {
    const platform = await this.platformModel.findByIdAndDelete(id);
    if (!platform) {
      throw new NotFoundException('Platform not found');
    }
  }

  // Platform Clicks Management
  async addPlatformClicks(
    addClicksDto: AddPlatformClicksDto, 
    adminId: string
  ): Promise<PlatformClick> {
    // Validate platform exists
    const platform = await this.platformModel.findById(addClicksDto.platformId);
    if (!platform) {
      throw new NotFoundException('Platform not found');
    }

    if (!platform.isActive) {
      throw new BadRequestException('Platform is not active');
    }

    // Validate user exists
    const user = await this.userModel.findById(addClicksDto.userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Get user's team to determine the rate
    const team = await this.teamModel.findById(user.teamId);
    if (!team) {
      throw new NotFoundException('Team not found');
    }

    // Calculate rate from team's rewards configuration
    let ratePerClick = addClicksDto.ratePerClick || 0.5; // Default fallback
    
    if (team.rewards && team.rewards.length > 0) {
      const reward = team.rewards[0]; // Use the first reward tier
      if (reward && reward.clicks > 0) {
        ratePerClick = reward.amount / reward.clicks;
        console.log(`Using team reward rate: ${reward.amount} PKR per ${reward.clicks} clicks = ${ratePerClick} PKR per click`);
      }
    } else {
      console.log('No team rewards configured, using default rate:', ratePerClick);
    }

    // Check if clicks already exist for this platform, user, and date
    const existingClicks = await this.platformClickModel.findOne({
      platformId: addClicksDto.platformId,
      userId: addClicksDto.userId,
      date: new Date(addClicksDto.date)
    });

    if (existingClicks) {
      throw new ConflictException('Clicks already exist for this platform, user, and date');
    }

    // Calculate earnings using the determined rate
    const earnings = addClicksDto.clicks * ratePerClick;

    // Create platform click record
    const platformClick = new this.platformClickModel({
      platformId: addClicksDto.platformId,
      userId: addClicksDto.userId,
      teamId: user.teamId,
      clicks: addClicksDto.clicks,
      date: new Date(addClicksDto.date),
      earnings,
      ratePerClick,
      notes: addClicksDto.notes,
      addedBy: adminId
    });

    const savedClick = await platformClick.save();

    // Update user's total earnings
    await this.userModel.findByIdAndUpdate(addClicksDto.userId, {
      $inc: { totalEarnings: earnings }
    });

    // Update team's total earnings
    await this.teamModel.findByIdAndUpdate(user.teamId, {
      $inc: { totalEarnings: earnings }
    });

    return savedClick;
  }

  async getPlatformClicks(
    userId?: string,
    platformId?: string,
    startDate?: string,
    endDate?: string,
    teamId?: string
  ): Promise<PlatformClick[]> {
    const filter: any = {};

    // Always filter by team for data isolation
    if (teamId) {
      filter.teamId = new Types.ObjectId(teamId);
    }

    if (userId) {
      filter.userId = userId;
    }

    if (platformId) {
      filter.platformId = platformId;
    }

    if (startDate || endDate) {
      filter.date = {};
      if (startDate) {
        filter.date.$gte = new Date(startDate);
      }
      if (endDate) {
        filter.date.$lte = new Date(endDate);
      }
    }

    return await this.platformClickModel
      .find(filter)
      .populate('platformId', 'name')
      .populate('userId', 'firstName lastName email')
      .populate('teamId', 'name')
      .populate('addedBy', 'firstName lastName')
      .sort({ date: -1 });
  }

  async getUserPlatformClicks(userId: string, teamId?: string): Promise<PlatformClick[]> {
    const filter: any = { userId };
    
    // Filter by team if provided for data isolation
    if (teamId) {
      filter.teamId = new Types.ObjectId(teamId);
    }
    
    return await this.platformClickModel
      .find(filter)
      .populate('platformId', 'name')
      .sort({ date: -1 });
  }

  async getTeamPlatformClicks(teamId: string): Promise<PlatformClick[]> {
    return await this.platformClickModel
      .find({ teamId: new Types.ObjectId(teamId) })
      .populate('platformId', 'name')
      .populate('userId', 'firstName lastName email')
      .sort({ date: -1 });
  }

  async getPlatformClicksStats(
    userId?: string,
    platformId?: string,
    startDate?: string,
    endDate?: string,
    teamId?: string
  ): Promise<any> {
    const filter: any = {};

    // Always filter by team for data isolation
    if (teamId) {
      filter.teamId = new Types.ObjectId(teamId);
    }

    if (userId) {
      filter.userId = userId;
    }

    if (platformId) {
      filter.platformId = platformId;
    }

    if (startDate || endDate) {
      filter.date = {};
      if (startDate) {
        filter.date.$gte = new Date(startDate);
      }
      if (endDate) {
        filter.date.$lte = new Date(endDate);
      }
    }

    const stats = await this.platformClickModel.aggregate([
      { $match: filter },
      {
        $group: {
          _id: null,
          totalClicks: { $sum: '$clicks' },
          totalEarnings: { $sum: '$earnings' },
          averageRatePerClick: { $avg: '$ratePerClick' },
          clickCount: { $sum: 1 }
        }
      }
    ]);

    return stats[0] || {
      totalClicks: 0,
      totalEarnings: 0,
      averageRatePerClick: 0,
      clickCount: 0
    };
  }

  async updatePlatformClicks(
    clickId: string,
    updateData: Partial<AddPlatformClicksDto>,
    adminId: string
  ): Promise<PlatformClick> {
    const existingClick = await this.platformClickModel.findById(clickId);
    if (!existingClick) {
      throw new NotFoundException('Platform click record not found');
    }

    // Get user's team to determine the rate
    const user = await this.userModel.findById(existingClick.userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const team = await this.teamModel.findById(user.teamId);
    if (!team) {
      throw new NotFoundException('Team not found');
    }

    // Calculate rate from team's rewards configuration
    let ratePerClick = updateData.ratePerClick || existingClick.ratePerClick || 0.5;
    
    if (team.rewards && team.rewards.length > 0) {
      const reward = team.rewards[0]; // Use the first reward tier
      if (reward && reward.clicks > 0) {
        ratePerClick = reward.amount / reward.clicks;
        console.log(`Using team reward rate for update: ${reward.amount} PKR per ${reward.clicks} clicks = ${ratePerClick} PKR per click`);
      }
    } else {
      console.log('No team rewards configured for update, using existing rate:', ratePerClick);
    }

    // Calculate new earnings if clicks or rate changed
    let newEarnings = existingClick.earnings;
    if (updateData.clicks !== undefined || ratePerClick !== existingClick.ratePerClick) {
      const clicks = updateData.clicks || existingClick.clicks;
      newEarnings = clicks * ratePerClick;
    }

    // Update the record
    const updatedClick = await this.platformClickModel.findByIdAndUpdate(
      clickId,
      {
        ...updateData,
        earnings: newEarnings,
        ratePerClick,
        updatedAt: new Date()
      },
      { new: true }
    );

    // Update user and team earnings if earnings changed
    if (newEarnings !== existingClick.earnings) {
      const earningsDifference = newEarnings - existingClick.earnings;
      
      await this.userModel.findByIdAndUpdate(existingClick.userId, {
        $inc: { totalEarnings: earningsDifference }
      });

      await this.teamModel.findByIdAndUpdate(existingClick.teamId, {
        $inc: { totalEarnings: earningsDifference }
      });
    }

    return updatedClick;
  }

  async deletePlatformClicks(clickId: string): Promise<void> {
    const click = await this.platformClickModel.findById(clickId);
    if (!click) {
      throw new NotFoundException('Platform click record not found');
    }

    // Remove earnings from user and team
    await this.userModel.findByIdAndUpdate(click.userId, {
      $inc: { totalEarnings: -click.earnings }
    });

    await this.teamModel.findByIdAndUpdate(click.teamId, {
      $inc: { totalEarnings: -click.earnings }
    });

    await this.platformClickModel.findByIdAndDelete(clickId);
  }
} 