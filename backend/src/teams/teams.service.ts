import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Team, TeamDocument } from './schemas/team.schema';
import { CreateTeamDto } from './dto/create-team.dto';

@Injectable()
export class TeamsService {
  constructor(
    @InjectModel(Team.name) private teamModel: Model<TeamDocument>,
  ) {}

  async create(createTeamDto: CreateTeamDto): Promise<TeamDocument> {
    const team = new this.teamModel(createTeamDto);
    return team.save();
  }

  async findById(id: string): Promise<TeamDocument> {
    const team = await this.teamModel.findById(id);
    if (!team) {
      throw new NotFoundException('Team not found');
    }
    return team;
  }

  async updateStats(teamId: string, urlCount: number, totalClicks: number): Promise<void> {
    await this.teamModel.findByIdAndUpdate(teamId, {
      urlCount,
      totalClicks,
    });
  }
} 