import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ClickAnalytics, ClickAnalyticsDocument } from './schemas/click-analytics.schema';

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectModel(ClickAnalytics.name) private clickAnalyticsModel: Model<ClickAnalyticsDocument>,
  ) {}

  async trackClick(
    urlId: string,
    userId: string,
    teamId: string,
    ipAddress: string,
    userAgent?: string,
    referer?: string,
  ): Promise<void> {
    const analytics = new this.clickAnalyticsModel({
      urlId: new Types.ObjectId(urlId),
      userId: new Types.ObjectId(userId),
      teamId: Types.ObjectId.createFromHexString(teamId),
      ipAddress,
      userAgent,
      referer,
    });

    await analytics.save();
  }

  async getUrlAnalytics(urlId: string, teamId: string): Promise<ClickAnalyticsDocument[]> {
    return this.clickAnalyticsModel
      .find({
        urlId: new Types.ObjectId(urlId),
        teamId: Types.ObjectId.createFromHexString(teamId),
      })
      .sort({ createdAt: -1 })
      .exec();
  }

  async getTeamAnalytics(teamId: string, page: number = 1, limit: number = 50): Promise<{
    analytics: ClickAnalyticsDocument[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const skip = (page - 1) * limit;
    const [analytics, total] = await Promise.all([
      this.clickAnalyticsModel
        .find({ teamId: Types.ObjectId.createFromHexString(teamId) })
        .populate('urlId', 'originalUrl shortCode')
        .populate('userId', 'firstName lastName email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.clickAnalyticsModel.countDocuments({ teamId: Types.ObjectId.createFromHexString(teamId) }),
    ]);

    return {
      analytics,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getUserAnalytics(userId: string, teamId: string): Promise<ClickAnalyticsDocument[]> {
    return this.clickAnalyticsModel
      .find({
        userId: new Types.ObjectId(userId),
        teamId: Types.ObjectId.createFromHexString(teamId),
      })
      .populate('urlId', 'originalUrl shortCode')
      .sort({ createdAt: -1 })
      .exec();
  }
} 