import { Injectable, NotFoundException, ConflictException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { nanoid } from 'nanoid';
import { Url, UrlDocument } from './schemas/url.schema';
import { CreateUrlDto } from './dto/create-url.dto';
import { CreateAdminUrlDto } from './dto/create-admin-url.dto';
import { UrlResponseDto } from './dto/url-response.dto';
import { AnalyticsService } from '../analytics/analytics.service';

@Injectable()
export class UrlsService {
  constructor(
    @InjectModel(Url.name) private urlModel: Model<UrlDocument>,
    private analyticsService: AnalyticsService,
  ) {}

  async createUrl(createUrlDto: CreateUrlDto, userId: string, teamId: string): Promise<UrlResponseDto> {
    const { originalUrl, customShortCode, title, description } = createUrlDto;

    // Check if custom short code is provided and if it's already taken
    if (customShortCode) {
      const existingUrl = await this.urlModel.findOne({ shortCode: customShortCode });
      if (existingUrl) {
        throw new ConflictException('Custom short code is already taken');
      }
    }

    // Generate short code if not provided
    let shortCode = customShortCode;
    if (!shortCode) {
      do {
        shortCode = nanoid(6);
      } while (await this.urlModel.findOne({ shortCode }));
    }

    // Create new URL
    const url = new this.urlModel({
      originalUrl,
      shortCode,
      userId: new Types.ObjectId(userId),
      teamId: Types.ObjectId.createFromHexString(teamId),
      title,
      description,
      isAdminCreated: false,
    });

    const savedUrl = await url.save();
    return this.mapToResponseDto(savedUrl);
  }

  async createAdminUrl(createAdminUrlDto: CreateAdminUrlDto, adminId: string, teamId: string): Promise<UrlResponseDto> {
    const { originalUrl, targetUserId, customShortCode, title, description } = createAdminUrlDto;

    // Check if custom short code is provided and if it's already taken
    if (customShortCode) {
      const existingUrl = await this.urlModel.findOne({ shortCode: customShortCode });
      if (existingUrl) {
        throw new ConflictException('Custom short code is already taken');
      }
    }

    // Generate short code if not provided
    let shortCode = customShortCode;
    if (!shortCode) {
      do {
        shortCode = nanoid(6);
      } while (await this.urlModel.findOne({ shortCode }));
    }

    // Create new URL as admin-created
    const url = new this.urlModel({
      originalUrl,
      shortCode,
      userId: new Types.ObjectId(targetUserId),
      teamId: Types.ObjectId.createFromHexString(teamId),
      title,
      description,
      isAdminCreated: true,
      createdByAdmin: new Types.ObjectId(adminId),
    });

    const savedUrl = await url.save();
    return this.mapToResponseDto(savedUrl);
  }

  async findByShortCode(shortCode: string): Promise<UrlDocument> {
    const url = await this.urlModel.findOne({ shortCode, isActive: true });

    if (!url) {
      throw new NotFoundException('URL not found');
    }

    return url;
  }

  async incrementClicks(shortCode: string, ipAddress: string, userAgent?: string, referer?: string): Promise<void> {
    const url = await this.findByShortCode(shortCode);
    
    // Check for recent clicks from the same IP to prevent double counting
    // const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    
    // Check if this IP has clicked this URL in the last 5 minutes
    // const recentClick = await this.analyticsService.findRecentClick(
    //   url._id.toString(),
    //   ipAddress,
    //   fiveMinutesAgo
    // );
    
    // if (recentClick) {
    //   // Skip incrementing if recent click exists from same IP
    //   return;
    // }
    
    // Increment clicks
    await this.urlModel.updateOne(
      { shortCode },
      { $inc: { clicks: 1 } }
    );

    // Track analytics - only if userId and teamId exist
    if (url.userId && url.teamId) {
      await this.analyticsService.trackClick(
        url._id.toString(),
        url.userId.toString(),
        url.teamId.toString(),
        ipAddress,
        userAgent,
        referer,
      );
    }
  }

  async findAllByUser(userId: string, teamId: string, page: number = 1, limit: number = 10): Promise<{
    urls: UrlResponseDto[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const skip = (page - 1) * limit;
    
    // Validate ObjectIds before using them
    let validUserId: Types.ObjectId;
    let validTeamId: Types.ObjectId;
    
    try {
      validUserId = new Types.ObjectId(userId);
    } catch (error) {
      throw new Error('Invalid user ID format');
    }
    
    try {
      validTeamId = Types.ObjectId.createFromHexString(teamId);
    } catch (error) {
      throw new Error('Invalid team ID format');
    }
    
    const query = { 
      userId: validUserId, 
      teamId: validTeamId 
    };
    
    const [urls, total] = await Promise.all([
      this.urlModel.find(query)
        .populate('createdByAdmin', 'firstName lastName email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.urlModel.countDocuments(query),
    ]);

    return {
      urls: urls.map(url => this.mapToResponseDto(url)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findUrlsAssignedToUser(userId: string, teamId: string, page: number = 1, limit: number = 10): Promise<{
    urls: UrlResponseDto[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const skip = (page - 1) * limit;
    
    // Validate ObjectIds before using them
    let validUserId: Types.ObjectId;
    let validTeamId: Types.ObjectId;
    
    try {
      validUserId = new Types.ObjectId(userId);
    } catch (error) {
      throw new Error('Invalid user ID format');
    }
    
    try {
      validTeamId = Types.ObjectId.createFromHexString(teamId);
    } catch (error) {
      throw new Error('Invalid team ID format');
    }
    
    const query = { 
      userId: validUserId, 
      teamId: validTeamId,
      isActive: true
    };
    
    const [urls, total] = await Promise.all([
      this.urlModel.find(query)
        .populate('createdByAdmin', 'firstName lastName email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.urlModel.countDocuments(query),
    ]);

    return {
      urls: urls.map(url => this.mapToResponseDto(url)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findAllByTeam(teamId: string, page: number = 1, limit: number = 10): Promise<{
    urls: UrlResponseDto[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const skip = (page - 1) * limit;
    const [urls, total] = await Promise.all([
      this.urlModel.find({ teamId: Types.ObjectId.createFromHexString(teamId) })
        .populate('userId', 'firstName lastName email')
        .populate('createdByAdmin', 'firstName lastName email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.urlModel.countDocuments({ teamId: Types.ObjectId.createFromHexString(teamId) }),
    ]);

    return {
      urls: urls.map(url => this.mapToResponseDto(url)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string, teamId: string): Promise<UrlResponseDto> {
    const url = await this.urlModel.findOne({ 
      _id: new Types.ObjectId(id), 
      teamId: Types.ObjectId.createFromHexString(teamId) 
    })
    .populate('userId', 'firstName lastName email')
    .populate('createdByAdmin', 'firstName lastName email');
    
    if (!url) {
      throw new NotFoundException('URL not found');
    }
    return this.mapToResponseDto(url);
  }

  async deactivateUrl(id: string, teamId: string, userId: string, userRole: string): Promise<void> {
    const url = await this.urlModel.findOne({ 
      _id: new Types.ObjectId(id), 
      teamId: Types.ObjectId.createFromHexString(teamId) 
    });
    
    if (!url) {
      throw new NotFoundException('URL not found');
    }

    // Check if user can deactivate this URL
    // Users can only deactivate their own URLs unless they're admin
    // Admins can deactivate any URL in their team
    if (userRole !== 'admin' && url.userId.toString() !== userId) {
      throw new ForbiddenException('You can only deactivate your own URLs');
    }

    url.isActive = false;
    await url.save();
  }

  async canUserModifyUrl(urlId: string, userId: string, userRole: string): Promise<boolean> {
    const url = await this.urlModel.findById(urlId);
    
    if (!url) {
      return false;
    }

    // Admins can modify any URL in their team
    if (userRole === 'admin') {
      return true;
    }

    // Users can only modify their own URLs that are not admin-created
    return url.userId.toString() === userId && !url.isAdminCreated;
  }

  async regenerateShortUrl(id: string, teamId: string): Promise<UrlResponseDto> {
    const url = await this.urlModel.findOne({ 
      _id: new Types.ObjectId(id), 
      teamId: Types.ObjectId.createFromHexString(teamId) 
    });
    
    if (!url) {
      throw new NotFoundException('URL not found');
    }

    // Generate new short code
    let newShortCode;
    do {
      newShortCode = nanoid(6);
    } while (await this.urlModel.findOne({ shortCode: newShortCode }));

    // Update the URL with new short code
    url.shortCode = newShortCode;
    const updatedUrl = await url.save();
    
    return this.mapToResponseDto(updatedUrl);
  }

  private mapToResponseDto(url: UrlDocument): UrlResponseDto {
    // Handle userId - it could be an ObjectId or a populated user object
    let userId: string;
    let user: any = undefined;
    
    if ((url as any).userId && typeof (url as any).userId === 'object' && (url as any).userId._id) {
      // userId is populated (user object)
      userId = (url as any).userId._id.toString();
      user = {
        id: (url as any).userId._id.toString(),
        firstName: (url as any).userId.firstName,
        lastName: (url as any).userId.lastName,
        email: (url as any).userId.email,
      };
    } else {
      // userId is just an ObjectId
      userId = url.userId ? url.userId.toString() : '';
    }

    // Use production URL for shortened URLs
    const baseUrl = process.env.BASE_URL || (process.env.NODE_ENV === 'production' ? 'https://shorly.uk' : 'http://localhost:3000');

    return {
      id: url._id.toString(),
      originalUrl: url.originalUrl,
      shortCode: url.shortCode,
      shortUrl: `${baseUrl}/${url.shortCode}`,
      clicks: url.clicks,
      isActive: url.isActive,
      title: url.title,
      description: url.description,
      userId: userId,
      user: user,
      isAdminCreated: url.isAdminCreated,
      createdByAdmin: (url as any).createdByAdmin && typeof (url as any).createdByAdmin === 'object' ? {
        id: (url as any).createdByAdmin._id.toString(),
        firstName: (url as any).createdByAdmin.firstName,
        lastName: (url as any).createdByAdmin.lastName,
        email: (url as any).createdByAdmin.email,
      } : undefined,
      createdAt: url.createdAt || new Date(),
      updatedAt: url.updatedAt || new Date(),
    };
  }
} 