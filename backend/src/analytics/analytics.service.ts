import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ClickAnalytics, ClickAnalyticsDocument } from './schemas/click-analytics.schema';
import { ReferralsService } from '../referrals/referrals.service';
import * as geoip from 'geoip-lite';

// Country code to full name mapping
const countryCodeToName: Record<string, string> = {
  'AF': 'Afghanistan', 'AL': 'Albania', 'DZ': 'Algeria', 'AS': 'American Samoa', 'AD': 'Andorra', 'AO': 'Angola', 'AI': 'Anguilla', 'AQ': 'Antarctica', 'AG': 'Antigua and Barbuda', 'AR': 'Argentina', 'AM': 'Armenia', 'AW': 'Aruba', 'AU': 'Australia', 'AT': 'Austria', 'AZ': 'Azerbaijan', 'BS': 'Bahamas', 'BH': 'Bahrain', 'BD': 'Bangladesh', 'BB': 'Barbados', 'BY': 'Belarus', 'BE': 'Belgium', 'BZ': 'Belize', 'BJ': 'Benin', 'BM': 'Bermuda', 'BT': 'Bhutan', 'BO': 'Bolivia', 'BA': 'Bosnia and Herzegovina', 'BW': 'Botswana', 'BV': 'Bouvet Island', 'BR': 'Brazil', 'IO': 'British Indian Ocean Territory', 'BN': 'Brunei Darussalam', 'BG': 'Bulgaria', 'BF': 'Burkina Faso', 'BI': 'Burundi', 'KH': 'Cambodia', 'CM': 'Cameroon', 'CA': 'Canada', 'CV': 'Cape Verde', 'KY': 'Cayman Islands', 'CF': 'Central African Republic', 'TD': 'Chad', 'CL': 'Chile', 'CN': 'China', 'CX': 'Christmas Island', 'CC': 'Cocos (Keeling) Islands', 'CO': 'Colombia', 'KM': 'Comoros', 'CG': 'Congo', 'CD': 'Congo, Democratic Republic of the', 'CK': 'Cook Islands', 'CR': 'Costa Rica', 'CI': 'Côte d\'Ivoire', 'HR': 'Croatia', 'CU': 'Cuba', 'CY': 'Cyprus', 'CZ': 'Czech Republic', 'DK': 'Denmark', 'DJ': 'Djibouti', 'DM': 'Dominica', 'DO': 'Dominican Republic', 'EC': 'Ecuador', 'EG': 'Egypt', 'SV': 'El Salvador', 'GQ': 'Equatorial Guinea', 'ER': 'Eritrea', 'EE': 'Estonia', 'ET': 'Ethiopia', 'FK': 'Falkland Islands (Malvinas)', 'FO': 'Faroe Islands', 'FJ': 'Fiji', 'FI': 'Finland', 'FR': 'France', 'GF': 'French Guiana', 'PF': 'French Polynesia', 'TF': 'French Southern Territories', 'GA': 'Gabon', 'GM': 'Gambia', 'GE': 'Georgia', 'DE': 'Germany', 'GH': 'Ghana', 'GI': 'Gibraltar', 'GR': 'Greece', 'GL': 'Greenland', 'GD': 'Grenada', 'GP': 'Guadeloupe', 'GU': 'Guam', 'GT': 'Guatemala', 'GG': 'Guernsey', 'GN': 'Guinea', 'GW': 'Guinea-Bissau', 'GY': 'Guyana', 'HT': 'Haiti', 'HM': 'Heard Island and McDonald Islands', 'VA': 'Holy See (Vatican City State)', 'HN': 'Honduras', 'HK': 'Hong Kong', 'HU': 'Hungary', 'IS': 'Iceland', 'IN': 'India', 'ID': 'Indonesia', 'IR': 'Iran, Islamic Republic of', 'IQ': 'Iraq', 'IE': 'Ireland', 'IM': 'Isle of Man', 'IL': 'Israel', 'IT': 'Italy', 'JM': 'Jamaica', 'JP': 'Japan', 'JE': 'Jersey', 'JO': 'Jordan', 'KZ': 'Kazakhstan', 'KE': 'Kenya', 'KI': 'Kiribati', 'KP': 'Korea, Democratic People\'s Republic of', 'KR': 'Korea, Republic of', 'KW': 'Kuwait', 'KG': 'Kyrgyzstan', 'LA': 'Lao People\'s Democratic Republic', 'LV': 'Latvia', 'LB': 'Lebanon', 'LS': 'Lesotho', 'LR': 'Liberia', 'LY': 'Libyan Arab Jamahiriya', 'LI': 'Liechtenstein', 'LT': 'Lithuania', 'LU': 'Luxembourg', 'MO': 'Macao', 'MK': 'Macedonia, The Former Yugoslav Republic of', 'MG': 'Madagascar', 'MW': 'Malawi', 'MY': 'Malaysia', 'MV': 'Maldives', 'ML': 'Mali', 'MT': 'Malta', 'MH': 'Marshall Islands', 'MQ': 'Martinique', 'MR': 'Mauritania', 'MU': 'Mauritius', 'YT': 'Mayotte', 'MX': 'Mexico', 'FM': 'Micronesia, Federated States of', 'MD': 'Moldova, Republic of', 'MC': 'Monaco', 'MN': 'Mongolia', 'ME': 'Montenegro', 'MS': 'Montserrat', 'MA': 'Morocco', 'MZ': 'Mozambique', 'MM': 'Myanmar', 'NA': 'Namibia', 'NR': 'Nauru', 'NP': 'Nepal', 'NL': 'Netherlands', 'NC': 'New Caledonia', 'NZ': 'New Zealand', 'NI': 'Nicaragua', 'NE': 'Niger', 'NG': 'Nigeria', 'NU': 'Niue', 'NF': 'Norfolk Island', 'MP': 'Northern Mariana Islands', 'NO': 'Norway', 'OM': 'Oman', 'PK': 'Pakistan', 'PW': 'Palau', 'PS': 'Palestinian Territory, Occupied', 'PA': 'Panama', 'PG': 'Papua New Guinea', 'PY': 'Paraguay', 'PE': 'Peru', 'PH': 'Philippines', 'PN': 'Pitcairn', 'PL': 'Poland', 'PT': 'Portugal', 'PR': 'Puerto Rico', 'QA': 'Qatar', 'RE': 'Réunion', 'RO': 'Romania', 'RU': 'Russian Federation', 'RW': 'Rwanda', 'BL': 'Saint Barthélemy', 'SH': 'Saint Helena, Ascension and Tristan da Cunha', 'KN': 'Saint Kitts and Nevis', 'LC': 'Saint Lucia', 'MF': 'Saint Martin (French part)', 'PM': 'Saint Pierre and Miquelon', 'VC': 'Saint Vincent and the Grenadines', 'WS': 'Samoa', 'SM': 'San Marino', 'ST': 'Sao Tome and Principe', 'SA': 'Saudi Arabia', 'SN': 'Senegal', 'RS': 'Serbia', 'SC': 'Seychelles', 'SL': 'Sierra Leone', 'SG': 'Singapore', 'SK': 'Slovakia', 'SI': 'Slovenia', 'SB': 'Solomon Islands', 'SO': 'Somalia', 'ZA': 'South Africa', 'GS': 'South Georgia and the South Sandwich Islands', 'ES': 'Spain', 'LK': 'Sri Lanka', 'SD': 'Sudan', 'SR': 'Suriname', 'SJ': 'Svalbard and Jan Mayen', 'SZ': 'Swaziland', 'SE': 'Sweden', 'CH': 'Switzerland', 'SY': 'Syrian Arab Republic', 'TW': 'Taiwan, Province of China', 'TJ': 'Tajikistan', 'TZ': 'Tanzania, United Republic of', 'TH': 'Thailand', 'TL': 'Timor-Leste', 'TG': 'Togo', 'TK': 'Tokelau', 'TO': 'Tonga', 'TT': 'Trinidad and Tobago', 'TN': 'Tunisia', 'TR': 'Turkey', 'TM': 'Turkmenistan', 'TC': 'Turks and Caicos Islands', 'TV': 'Tuvalu', 'UG': 'Uganda', 'UA': 'Ukraine', 'AE': 'United Arab Emirates', 'GB': 'United Kingdom', 'US': 'United States', 'UM': 'United States Minor Outlying Islands', 'UY': 'Uruguay', 'UZ': 'Uzbekistan', 'VU': 'Vanuatu', 'VE': 'Venezuela, Bolivarian Republic of', 'VN': 'Viet Nam', 'VG': 'Virgin Islands, British', 'VI': 'Virgin Islands, U.S.', 'WF': 'Wallis and Futuna', 'EH': 'Western Sahara', 'YE': 'Yemen', 'ZM': 'Zambia', 'ZW': 'Zimbabwe'
};

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectModel(ClickAnalytics.name) private clickAnalyticsModel: Model<ClickAnalyticsDocument>,
    private referralsService: ReferralsService,
  ) {}

  // Helper method to get full country name from country code
  private getCountryName(countryCode: string): string {
    return countryCodeToName[countryCode] || countryCode;
  }

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
      country: this.getCountryName(stat._id),
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
      country: this.getCountryName(stat._id),
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
      country: this.getCountryName(stat._id),
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
      country: this.getCountryName(stat._id),
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
      country: this.getCountryName(country._id),
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
      country: this.getCountryName(country._id),
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
        country: this.getCountryName(click.country || ''),
        city: click.city || '',
        userAgent: click.userAgent || '',
        referer: click.referer || '',
        createdAt: click.createdAt
      })),
      countryMap,
      topCountries
    };
  }

  async getReferrerAnalytics(
    userId: string,
    teamId: string,
    startDate?: string,
    endDate?: string,
  ): Promise<Array<{
    referrer: string;
    referrerName: string;
    clicks: number;
    percentage: number;
  }>> {
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

    // Get referrer statistics
    const referrerStats = await this.clickAnalyticsModel.aggregate([
      {
        $match: queryFilter
      },
      {
        $group: {
          _id: '$referer',
          clicks: { $sum: 1 }
        }
      },
      {
        $sort: { clicks: -1 }
      }
    ]);

    const totalClicks = await this.clickAnalyticsModel.countDocuments(queryFilter);

    return referrerStats.map(stat => {
      const referrerName = this.getReferrerDisplayName(stat._id);
      return {
        referrer: stat._id || '',
        referrerName,
        clicks: stat.clicks,
        percentage: totalClicks > 0 ? Math.round((stat.clicks / totalClicks) * 100 * 100) / 100 : 0,
      };
    });
  }

  private getReferrerDisplayName(referer: string): string {
    if (!referer) return 'Direct';
    
    try {
      const url = new URL(referer);
      const hostname = url.hostname.toLowerCase();
      
      // Common social media platforms
      if (hostname.includes('facebook.com') || hostname.includes('fb.com')) return 'Facebook';
      if (hostname.includes('twitter.com') || hostname.includes('x.com')) return 'Twitter/X';
      if (hostname.includes('instagram.com')) return 'Instagram';
      if (hostname.includes('linkedin.com')) return 'LinkedIn';
      if (hostname.includes('youtube.com')) return 'YouTube';
      if (hostname.includes('tiktok.com')) return 'TikTok';
      if (hostname.includes('reddit.com')) return 'Reddit';
      if (hostname.includes('pinterest.com')) return 'Pinterest';
      if (hostname.includes('snapchat.com')) return 'Snapchat';
      if (hostname.includes('whatsapp.com')) return 'WhatsApp';
      if (hostname.includes('telegram.org')) return 'Telegram';
      if (hostname.includes('discord.com')) return 'Discord';
      if (hostname.includes('slack.com')) return 'Slack';
      if (hostname.includes('google.com') || hostname.includes('google.co')) return 'Google';
      if (hostname.includes('bing.com')) return 'Bing';
      if (hostname.includes('yahoo.com')) return 'Yahoo';
      if (hostname.includes('duckduckgo.com')) return 'DuckDuckGo';
      if (hostname.includes('github.com')) return 'GitHub';
      if (hostname.includes('stackoverflow.com')) return 'Stack Overflow';
      if (hostname.includes('medium.com')) return 'Medium';
      if (hostname.includes('wordpress.com')) return 'WordPress';
      if (hostname.includes('wix.com')) return 'Wix';
      if (hostname.includes('squarespace.com')) return 'Squarespace';
      if (hostname.includes('shopify.com')) return 'Shopify';
      if (hostname.includes('amazon.com') || hostname.includes('amazon.co')) return 'Amazon';
      if (hostname.includes('ebay.com')) return 'eBay';
      if (hostname.includes('etsy.com')) return 'Etsy';
      if (hostname.includes('craigslist.org')) return 'Craigslist';
      if (hostname.includes('gmail.com') || hostname.includes('mail.google.com')) return 'Gmail';
      if (hostname.includes('outlook.com') || hostname.includes('hotmail.com')) return 'Outlook';
      if (hostname.includes('yahoo.com') && url.pathname.includes('mail')) return 'Yahoo Mail';
      
      // Return the hostname if no specific match
      return hostname.replace('www.', '');
    } catch (error) {
      // If URL parsing fails, try to extract domain from the string
      const domainMatch = referer.match(/https?:\/\/([^\/]+)/);
      if (domainMatch) {
        return domainMatch[1].replace('www.', '');
      }
      return 'Unknown';
    }
  }
} 