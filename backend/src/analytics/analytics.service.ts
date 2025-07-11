import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ClickAnalytics, ClickAnalyticsDocument } from './schemas/click-analytics.schema';
import { ReferralsService } from '../referrals/referrals.service';
import * as geoip from 'geoip-lite';

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectModel(ClickAnalytics.name) private clickAnalyticsModel: Model<ClickAnalyticsDocument>,
    private referralsService: ReferralsService,
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

    // Process referral earnings from this click
    await this.referralsService.processReferralEarningsFromClick(userId);
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

  async getUserAnalytics(
    userId: string,
    teamId: string,
    startDate?: string,
    endDate?: string,
  ): Promise<ClickAnalyticsDocument[]> {
    const queryFilter: any = {
      userId: new Types.ObjectId(userId),
      teamId: Types.ObjectId.createFromHexString(teamId),
    };

    // Add date range filtering if provided
    if (startDate || endDate) {
      queryFilter.createdAt = {};
      if (startDate) {
        queryFilter.createdAt.$gte = new Date(startDate);
      }
      if (endDate) {
        queryFilter.createdAt.$lte = new Date(endDate + 'T23:59:59.999Z');
      }
    }

    return this.clickAnalyticsModel
      .find(queryFilter)
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

  async getDetailedCountryAnalytics(
    teamId: string,
    startDate?: string,
    endDate?: string,
  ): Promise<Array<{
    country: string;
    countryCode: string;
    clicks: number;
    cities: Array<{ city: string; clicks: number }>;
    ipAddresses: string[];
  }>> {
    const matchStage: any = {
      teamId: Types.ObjectId.createFromHexString(teamId),
      country: { $exists: true, $ne: null }
    };

    // Add date range filtering if provided
    if (startDate || endDate) {
      matchStage.createdAt = {};
      if (startDate) {
        matchStage.createdAt.$gte = new Date(startDate);
      }
      if (endDate) {
        matchStage.createdAt.$lte = new Date(endDate + 'T23:59:59.999Z');
      }
    }

    const detailedStats = await this.clickAnalyticsModel.aggregate([
      {
        $match: matchStage
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

  async getUserDetailedCountryAnalytics(
    userId: string,
    teamId: string,
    startDate?: string,
    endDate?: string,
  ): Promise<Array<{
    country: string;
    countryCode: string;
    clicks: number;
    cities: Array<{ city: string; clicks: number }>;
    ipAddresses: string[];
  }>> {
    const matchStage: any = {
      userId: new Types.ObjectId(userId),
      teamId: Types.ObjectId.createFromHexString(teamId),
      country: { $exists: true, $ne: null }
    };

    // Add date range filtering if provided
    if (startDate || endDate) {
      matchStage.createdAt = {};
      if (startDate) {
        matchStage.createdAt.$gte = new Date(startDate);
      }
      if (endDate) {
        matchStage.createdAt.$lte = new Date(endDate + 'T23:59:59.999Z');
      }
    }

    const detailedStats = await this.clickAnalyticsModel.aggregate([
      {
        $match: matchStage
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

  async getTeamMemberClickStats(
    teamId: string,
    startDate?: string,
    endDate?: string,
  ) {
    const matchStage: any = {
      teamId: Types.ObjectId.createFromHexString(teamId)
    };

    // Add date range filtering if provided
    if (startDate || endDate) {
      matchStage.createdAt = {};
      if (startDate) {
        matchStage.createdAt.$gte = new Date(startDate);
      }
      if (endDate) {
        matchStage.createdAt.$lte = new Date(endDate + 'T23:59:59.999Z');
      }
    }

    // Aggregate total clicks per user in the team
    const stats = await this.clickAnalyticsModel.aggregate([
      {
        $match: matchStage
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

  async getTeamTotalClicksForMonth(
    teamId: string,
    year?: number,
    month?: number,
    startDate?: string,
    endDate?: string,
  ): Promise<{
    totalClicks: number;
    year: number;
    month: number;
    monthName: string;
  }> {
    const now = new Date();
    const targetYear = year || now.getFullYear();
    const targetMonth = month || now.getMonth() + 1; // getMonth() returns 0-11

    let queryFilter: any = {
      teamId: Types.ObjectId.createFromHexString(teamId)
    };

    // Use date range if provided, otherwise use month/year
    if (startDate || endDate) {
      queryFilter.createdAt = {};
      if (startDate) {
        queryFilter.createdAt.$gte = new Date(startDate);
      }
      if (endDate) {
        queryFilter.createdAt.$lte = new Date(endDate + 'T23:59:59.999Z');
      }
    } else {
      const startDate = new Date(targetYear, targetMonth - 1, 1);
      const endDate = new Date(targetYear, targetMonth, 0, 23, 59, 59, 999);
      queryFilter.createdAt = {
        $gte: startDate,
        $lte: endDate
      };
    }

    const totalClicks = await this.clickAnalyticsModel.countDocuments(queryFilter);

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

  async getTeamCountries(
    teamId: string,
    startDate?: string,
    endDate?: string,
  ): Promise<Array<{
    country: string;
    countryCode: string;
    clicks: number;
    percentage: number;
  }>> {
    const matchStage: any = {
      teamId: Types.ObjectId.createFromHexString(teamId),
      country: { $exists: true, $ne: null }
    };

    // Add date range filtering if provided
    if (startDate || endDate) {
      matchStage.createdAt = {};
      if (startDate) {
        matchStage.createdAt.$gte = new Date(startDate);
      }
      if (endDate) {
        matchStage.createdAt.$lte = new Date(endDate + 'T23:59:59.999Z');
      }
    }

    const totalClicks = await this.clickAnalyticsModel.countDocuments(matchStage);

    const countryStats = await this.clickAnalyticsModel.aggregate([
      {
        $match: matchStage
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

  async getTopTeamCountries(
    teamId: string,
    limit: number = 10,
    startDate?: string,
    endDate?: string,
  ): Promise<Array<{
    country: string;
    countryCode: string;
    clicks: number;
    percentage: number;
    cities: Array<{ city: string; clicks: number }>;
  }>> {
    const matchStage: any = {
      teamId: Types.ObjectId.createFromHexString(teamId),
      country: { $exists: true, $ne: null }
    };

    // Add date range filtering if provided
    if (startDate || endDate) {
      matchStage.createdAt = {};
      if (startDate) {
        matchStage.createdAt.$gte = new Date(startDate);
      }
      if (endDate) {
        matchStage.createdAt.$lte = new Date(endDate + 'T23:59:59.999Z');
      }
    }

    const totalClicks = await this.clickAnalyticsModel.countDocuments(matchStage);

    const topCountries = await this.clickAnalyticsModel.aggregate([
      {
        $match: matchStage
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

    return topCountries.map(country => ({
      country: country._id,
      countryCode: country._id,
      clicks: country.totalClicks,
      percentage: totalClicks > 0 ? Math.round((country.totalClicks / totalClicks) * 100 * 100) / 100 : 0,
      cities: country.cities.filter(city => city.city).map(city => ({
        city: city.city,
        clicks: city.clicks
      }))
    }));
  }

  async getMyTotalClicks(
    userId: string,
    teamId: string,
    startDate?: string,
    endDate?: string,
  ): Promise<{
    totalClicks: number;
    uniqueIPs: number;
    uniqueCountries: number;
    detailedClicks: Array<{
      _id: string;
      urlId: { originalUrl: string; shortCode: string };
      ipAddress: string;
      country: string;
      city: string;
      userAgent: string;
      referer: string;
      createdAt: Date;
    }>;
    countryMap: Array<{
      country: string;
      countryCode: string;
      clicks: number;
      percentage: number;
      cities: Array<{ city: string; clicks: number }>;
    }>;
    topCountries: Array<{
      country: string;
      countryCode: string;
      clicks: number;
      percentage: number;
    }>;
  }> {
    const queryFilter: any = {
      userId: new Types.ObjectId(userId),
      teamId: Types.ObjectId.createFromHexString(teamId),
    };

    // Add date range filtering if provided
    if (startDate || endDate) {
      queryFilter.createdAt = {};
      if (startDate) {
        queryFilter.createdAt.$gte = new Date(startDate);
      }
      if (endDate) {
        queryFilter.createdAt.$lte = new Date(endDate + 'T23:59:59.999Z');
      }
    }

    // Get total clicks
    const totalClicks = await this.clickAnalyticsModel.countDocuments(queryFilter);

    // Get unique IPs count
    const uniqueIPs = await this.clickAnalyticsModel.distinct('ipAddress', queryFilter);
    const uniqueIPsCount = uniqueIPs.filter(ip => ip).length;

    // Get unique countries count
    const uniqueCountries = await this.clickAnalyticsModel.distinct('country', queryFilter);
    const uniqueCountriesCount = uniqueCountries.filter(country => country).length;

    // Get detailed clicks data
    const detailedClicks = await this.clickAnalyticsModel
      .find(queryFilter)
      .populate('urlId', 'originalUrl shortCode')
      .sort({ createdAt: -1 })
      .limit(100) // Limit to last 100 clicks for performance
      .exec();

    // Get country map data
    const countryMapData = await this.clickAnalyticsModel.aggregate([
      {
        $match: {
          ...queryFilter,
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
      }
    ]);

    const countryMap = countryMapData.map(country => ({
      country: country._id,
      countryCode: country._id,
      clicks: country.totalClicks,
      percentage: totalClicks > 0 ? Math.round((country.totalClicks / totalClicks) * 100 * 100) / 100 : 0,
      cities: country.cities.filter(city => city.city).map(city => ({
        city: city.city,
        clicks: city.clicks
      }))
    }));

    // Get top countries (simplified version for display)
    const topCountries = countryMap.slice(0, 10).map(country => ({
      country: country.country,
      countryCode: country.countryCode,
      clicks: country.clicks,
      percentage: country.percentage
    }));

    return {
      totalClicks,
      uniqueIPs: uniqueIPsCount,
      uniqueCountries: uniqueCountriesCount,
      detailedClicks: detailedClicks.map(click => ({
        _id: click._id.toString(),
        urlId: {
          originalUrl: (click.urlId as any)?.originalUrl || '',
          shortCode: (click.urlId as any)?.shortCode || ''
        },
        ipAddress: click.ipAddress || '',
        country: click.country || '',
        city: click.city || '',
        userAgent: click.userAgent || '',
        referer: click.referer || '',
        createdAt: click.createdAt
      })),
      countryMap,
      topCountries
    };
  }
} 