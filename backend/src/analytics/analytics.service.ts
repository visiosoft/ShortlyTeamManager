import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ClickAnalytics, ClickAnalyticsDocument } from './schemas/click-analytics.schema';
import * as geoip from 'geoip-lite';

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
    // Get geolocation data from IP
    const geo = geoip.lookup(ipAddress);
    
    const analytics = new this.clickAnalyticsModel({
      urlId: new Types.ObjectId(urlId),
      userId: new Types.ObjectId(userId),
      teamId: Types.ObjectId.createFromHexString(teamId),
      ipAddress,
      userAgent,
      referer,
      country: geo?.country,
      city: geo?.city,
    });

    await analytics.save();
  }

  async findRecentClick(
    urlId: string,
    ipAddress: string,
    since: Date,
  ): Promise<ClickAnalyticsDocument | null> {
    return this.clickAnalyticsModel.findOne({
      urlId: new Types.ObjectId(urlId),
      ipAddress,
      createdAt: { $gte: since }
    }).exec();
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

  async getCountryAnalytics(teamId: string): Promise<Array<{ country: string; clicks: number; countryCode: string }>> {
    const countryStats = await this.clickAnalyticsModel.aggregate([
      {
        $match: {
          teamId: Types.ObjectId.createFromHexString(teamId),
          country: { $exists: true, $ne: null }
        }
      },
      {
        $group: {
          _id: '$country',
          clicks: { $sum: 1 }
        }
      },
      {
        $sort: { clicks: -1 }
      }
    ]);

    return countryStats.map(stat => ({
      country: stat._id,
      clicks: stat.clicks,
      countryCode: stat._id // Using country code as is for now
    }));
  }

  async getDetailedCountryAnalytics(teamId: string): Promise<Array<{
    country: string;
    countryCode: string;
    clicks: number;
    cities: Array<{ city: string; clicks: number }>;
    ipAddresses: string[];
  }>> {
    const detailedStats = await this.clickAnalyticsModel.aggregate([
      {
        $match: {
          teamId: Types.ObjectId.createFromHexString(teamId),
          country: { $exists: true, $ne: null }
        }
      },
      {
        $group: {
          _id: {
            country: '$country',
            city: '$city',
            ipAddress: '$ipAddress'
          },
          clicks: { $sum: 1 }
        }
      },
      {
        $group: {
          _id: '$_id.country',
          totalClicks: { $sum: '$clicks' },
          cities: {
            $push: {
              city: '$_id.city',
              clicks: '$clicks'
            }
          },
          ipAddresses: { $addToSet: '$_id.ipAddress' }
        }
      },
      {
        $sort: { totalClicks: -1 }
      }
    ]);

    return detailedStats.map(stat => ({
      country: stat._id,
      countryCode: stat._id,
      clicks: stat.totalClicks,
      cities: stat.cities.filter(city => city.city).map(city => ({
        city: city.city,
        clicks: city.clicks
      })),
      ipAddresses: stat.ipAddresses
    }));
  }

  async getUserDetailedCountryAnalytics(userId: string, teamId: string): Promise<Array<{
    country: string;
    countryCode: string;
    clicks: number;
    cities: Array<{ city: string; clicks: number }>;
    ipAddresses: string[];
  }>> {
    const detailedStats = await this.clickAnalyticsModel.aggregate([
      {
        $match: {
          userId: new Types.ObjectId(userId),
          teamId: Types.ObjectId.createFromHexString(teamId),
          country: { $exists: true, $ne: null }
        }
      },
      {
        $group: {
          _id: {
            country: '$country',
            city: '$city',
            ipAddress: '$ipAddress'
          },
          clicks: { $sum: 1 }
        }
      },
      {
        $group: {
          _id: '$_id.country',
          totalClicks: { $sum: '$clicks' },
          cities: {
            $push: {
              city: '$_id.city',
              clicks: '$clicks'
            }
          },
          ipAddresses: { $addToSet: '$_id.ipAddress' }
        }
      },
      {
        $sort: { totalClicks: -1 }
      }
    ]);

    return detailedStats.map(stat => ({
      country: stat._id,
      countryCode: stat._id,
      clicks: stat.totalClicks,
      cities: stat.cities.filter(city => city.city).map(city => ({
        city: city.city,
        clicks: city.clicks
      })),
      ipAddresses: stat.ipAddresses
    }));
  }

  async getTeamMemberClickStats(teamId: string) {
    // Aggregate total clicks per user in the team
    const stats = await this.clickAnalyticsModel.aggregate([
      {
        $match: {
          teamId: Types.ObjectId.createFromHexString(teamId)
        }
      },
      {
        $group: {
          _id: '$userId',
          clicks: { $sum: 1 }
        }
      },
      {
        $sort: { clicks: -1 }
      }
    ]);

    // Populate user info
    // Note: Mongoose aggregate does not auto-populate, so we fetch users manually
    const userIds = stats.map(s => s._id);
    const users = await this.clickAnalyticsModel.db.collection('users').find({ _id: { $in: userIds } }).toArray();
    const userMap = Object.fromEntries(users.map(u => [u._id.toString(), u]));

    return stats.map(s => ({
      userId: s._id,
      clicks: s.clicks,
      user: userMap[s._id.toString()] || null
    }));
  }
} 