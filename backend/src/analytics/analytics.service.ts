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
    ipAddress?: string,
    userAgent?: string,
    referer?: string,
  ): Promise<void> {
    // Get geolocation data from IP if available
    const geo = ipAddress ? geoip.lookup(ipAddress) : null;
    
    const analytics = new this.clickAnalyticsModel({
      urlId: new Types.ObjectId(urlId),
      userId: new Types.ObjectId(userId),
      teamId: Types.ObjectId.createFromHexString(teamId),
      ipAddress: ipAddress || null,
      userAgent,
      referer,
      country: geo?.country || null,
      city: geo?.city || null,
    });

    await analytics.save();
  }

  async findRecentClick(
    urlId: string,
    since: Date,
    ipAddress?: string,
  ): Promise<ClickAnalyticsDocument | null> {
    const query: any = {
      urlId: new Types.ObjectId(urlId),
      createdAt: { $gte: since }
    };
    
    // Only add IP address to query if it's provided
    if (ipAddress) {
      query.ipAddress = ipAddress;
    }
    
    return this.clickAnalyticsModel.findOne(query).exec();
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

  async getTeamTotalClicksForMonth(teamId: string, year?: number, month?: number): Promise<{
    totalClicks: number;
    year: number;
    month: number;
    monthName: string;
  }> {
    const now = new Date();
    const targetYear = year || now.getFullYear();
    const targetMonth = month || now.getMonth() + 1; // getMonth() returns 0-11

    const startDate = new Date(targetYear, targetMonth - 1, 1);
    const endDate = new Date(targetYear, targetMonth, 0, 23, 59, 59, 999);

    const totalClicks = await this.clickAnalyticsModel.countDocuments({
      teamId: Types.ObjectId.createFromHexString(teamId),
      createdAt: {
        $gte: startDate,
        $lte: endDate
      }
    });

    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];

    return {
      totalClicks,
      year: targetYear,
      month: targetMonth,
      monthName: monthNames[targetMonth - 1]
    };
  }

  async getTeamCountries(teamId: string): Promise<Array<{
    country: string;
    countryCode: string;
    clicks: number;
    percentage: number;
  }>> {
    const totalClicks = await this.clickAnalyticsModel.countDocuments({
      teamId: Types.ObjectId.createFromHexString(teamId),
      country: { $exists: true, $ne: null }
    });

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
      countryCode: stat._id,
      clicks: stat.clicks,
      percentage: totalClicks > 0 ? Math.round((stat.clicks / totalClicks) * 100 * 100) / 100 : 0
    }));
  }

  async getTopTeamCountries(teamId: string, limit: number = 10): Promise<Array<{
    country: string;
    countryCode: string;
    clicks: number;
    percentage: number;
    cities: Array<{ city: string; clicks: number }>;
  }>> {
    const totalClicks = await this.clickAnalyticsModel.countDocuments({
      teamId: Types.ObjectId.createFromHexString(teamId),
      country: { $exists: true, $ne: null }
    });

    const topCountries = await this.clickAnalyticsModel.aggregate([
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
            city: '$city'
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
          }
        }
      },
      {
        $sort: { totalClicks: -1 }
      },
      {
        $limit: limit
      }
    ]);

    return topCountries.map(stat => ({
      country: stat._id,
      countryCode: stat._id,
      clicks: stat.totalClicks,
      percentage: totalClicks > 0 ? Math.round((stat.totalClicks / totalClicks) * 100 * 100) / 100 : 0,
      cities: stat.cities
        .filter(city => city.city)
        .sort((a, b) => b.clicks - a.clicks)
        .slice(0, 5) // Top 5 cities per country
    }));
  }
} 