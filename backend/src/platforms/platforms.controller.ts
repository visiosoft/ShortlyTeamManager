import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  NotFoundException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { PlatformsService } from './platforms.service';
import { CreatePlatformDto } from './dto/create-platform.dto';
import { AddPlatformClicksDto } from './dto/add-platform-clicks.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('platforms')
@Controller('platforms')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class PlatformsController {
  constructor(private readonly platformsService: PlatformsService) {}

  // Platform Management Endpoints
  @Post()
  @Roles('admin')
  @ApiOperation({ summary: 'Create a new platform' })
  @ApiResponse({ status: 201, description: 'Platform created successfully' })
  async createPlatform(@Body() createPlatformDto: CreatePlatformDto) {
    return await this.platformsService.createPlatform(createPlatformDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all platforms' })
  @ApiResponse({ status: 200, description: 'List of all platforms' })
  async getAllPlatforms() {
    return await this.platformsService.getAllPlatforms();
  }

  @Get('active')
  @ApiOperation({ summary: 'Get active platforms only' })
  @ApiResponse({ status: 200, description: 'List of active platforms' })
  async getActivePlatforms() {
    return await this.platformsService.getActivePlatforms();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get platform by ID' })
  @ApiResponse({ status: 200, description: 'Platform details' })
  async getPlatformById(@Param('id') id: string) {
    return await this.platformsService.getPlatformById(id);
  }

  @Put(':id')
  @Roles('admin')
  @ApiOperation({ summary: 'Update platform' })
  @ApiResponse({ status: 200, description: 'Platform updated successfully' })
  async updatePlatform(
    @Param('id') id: string,
    @Body() updateData: Partial<CreatePlatformDto>
  ) {
    return await this.platformsService.updatePlatform(id, updateData);
  }

  @Delete(':id')
  @Roles('admin')
  @ApiOperation({ summary: 'Delete platform' })
  @ApiResponse({ status: 200, description: 'Platform deleted successfully' })
  async deletePlatform(@Param('id') id: string) {
    return await this.platformsService.deletePlatform(id);
  }

  // Platform Clicks Management Endpoints
  @Post('clicks')
  @Roles('admin')
  @ApiOperation({ summary: 'Add platform clicks for a user' })
  @ApiResponse({ status: 201, description: 'Platform clicks added successfully' })
  async addPlatformClicks(
    @Body() addClicksDto: AddPlatformClicksDto,
    @Request() req: any
  ) {
    return await this.platformsService.addPlatformClicks(
      addClicksDto,
      req.user.userId
    );
  }

  @Get('clicks/all')
  @Roles('admin')
  @ApiOperation({ summary: 'Get all platform clicks with filters (Admin only)' })
  @ApiQuery({ name: 'userId', required: false, description: 'Filter by user ID' })
  @ApiQuery({ name: 'platformId', required: false, description: 'Filter by platform ID' })
  @ApiQuery({ name: 'startDate', required: false, description: 'Start date filter (YYYY-MM-DD)' })
  @ApiQuery({ name: 'endDate', required: false, description: 'End date filter (YYYY-MM-DD)' })
  @ApiResponse({ status: 200, description: 'List of platform clicks' })
  async getPlatformClicks(
    @Request() req: any,
    @Query('userId') userId?: string,
    @Query('platformId') platformId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    // Get user's team ID for data isolation
    const user = await this.platformsService['userModel'].findById(req.user.userId);
    if (!user || !user.teamId) {
      return [];
    }
    
    return await this.platformsService.getPlatformClicks(
      userId,
      platformId,
      startDate,
      endDate,
      user.teamId.toString()
    );
  }

  @Get('clicks/user/:userId')
  @ApiOperation({ summary: 'Get platform clicks for a specific user (same team only)' })
  @ApiResponse({ status: 200, description: 'User platform clicks' })
  async getUserPlatformClicks(
    @Param('userId') userId: string,
    @Request() req: any
  ) {
    // Get user's team ID for data isolation
    const user = await this.platformsService['userModel'].findById(req.user.userId);
    if (!user || !user.teamId) {
      return [];
    }
    
    // Verify the requested user is in the same team
    const targetUser = await this.platformsService['userModel'].findById(userId);
    if (!targetUser || targetUser.teamId.toString() !== user.teamId.toString()) {
      return []; // Return empty array if user is not in same team
    }
    
    return await this.platformsService.getUserPlatformClicks(userId, user.teamId.toString());
  }

  @Get('clicks/team/:teamId')
  @ApiOperation({ summary: 'Get platform clicks for a specific team (same team only)' })
  @ApiResponse({ status: 200, description: 'Team platform clicks' })
  async getTeamPlatformClicks(
    @Param('teamId') teamId: string,
    @Request() req: any
  ) {
    // Get user's team ID for data isolation
    const user = await this.platformsService['userModel'].findById(req.user.userId);
    if (!user || !user.teamId) {
      return [];
    }
    
    // Only allow access to own team's data
    if (teamId !== user.teamId.toString()) {
      return []; // Return empty array if not same team
    }
    
    return await this.platformsService.getTeamPlatformClicks(teamId);
  }

  @Get('clicks/stats')
  @ApiOperation({ summary: 'Get platform clicks statistics (same team only)' })
  @ApiQuery({ name: 'userId', required: false, description: 'Filter by user ID' })
  @ApiQuery({ name: 'platformId', required: false, description: 'Filter by platform ID' })
  @ApiQuery({ name: 'startDate', required: false, description: 'Start date filter (YYYY-MM-DD)' })
  @ApiQuery({ name: 'endDate', required: false, description: 'End date filter (YYYY-MM-DD)' })
  @ApiResponse({ status: 200, description: 'Platform clicks statistics' })
  async getPlatformClicksStats(
    @Request() req: any,
    @Query('userId') userId?: string,
    @Query('platformId') platformId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    // Get user's team ID for data isolation
    const user = await this.platformsService['userModel'].findById(req.user.userId);
    if (!user || !user.teamId) {
      return {
        totalClicks: 0,
        totalEarnings: 0,
        averageRatePerClick: 0,
        clickCount: 0
      };
    }
    
    return await this.platformsService.getPlatformClicksStats(
      userId,
      platformId,
      startDate,
      endDate,
      user.teamId.toString()
    );
  }

  @Put('clicks/:clickId')
  @Roles('admin')
  @ApiOperation({ summary: 'Update platform clicks (same team only)' })
  @ApiResponse({ status: 200, description: 'Platform clicks updated successfully' })
  async updatePlatformClicks(
    @Param('clickId') clickId: string,
    @Body() updateData: Partial<AddPlatformClicksDto>,
    @Request() req: any
  ) {
    // Get user's team ID for data isolation
    const user = await this.platformsService['userModel'].findById(req.user.userId);
    if (!user || !user.teamId) {
      throw new NotFoundException('User not found or no team assigned');
    }
    
    // Verify the click record belongs to the same team
    const clickRecord = await this.platformsService['platformClickModel'].findById(clickId);
    if (!clickRecord || clickRecord.teamId.toString() !== user.teamId.toString()) {
      throw new NotFoundException('Platform click record not found or access denied');
    }
    
    return await this.platformsService.updatePlatformClicks(
      clickId,
      updateData,
      req.user.userId
    );
  }

  @Delete('clicks/:clickId')
  @Roles('admin')
  @ApiOperation({ summary: 'Delete platform clicks (same team only)' })
  @ApiResponse({ status: 200, description: 'Platform clicks deleted successfully' })
  async deletePlatformClicks(
    @Param('clickId') clickId: string,
    @Request() req: any
  ) {
    // Get user's team ID for data isolation
    const user = await this.platformsService['userModel'].findById(req.user.userId);
    if (!user || !user.teamId) {
      throw new NotFoundException('User not found or no team assigned');
    }
    
    // Verify the click record belongs to the same team
    const clickRecord = await this.platformsService['platformClickModel'].findById(clickId);
    if (!clickRecord || clickRecord.teamId.toString() !== user.teamId.toString()) {
      throw new NotFoundException('Platform click record not found or access denied');
    }
    
    return await this.platformsService.deletePlatformClicks(clickId);
  }

  // User-specific endpoints
  @Get('clicks/my-clicks')
  @ApiOperation({ summary: 'Get current user platform clicks' })
  @ApiResponse({ status: 200, description: 'Current user platform clicks' })
  async getMyPlatformClicks(@Request() req: any) {
    // Get user's team ID for data isolation
    const user = await this.platformsService['userModel'].findById(req.user.userId);
    if (!user || !user.teamId) {
      return [];
    }
    
    return await this.platformsService.getUserPlatformClicks(req.user.userId, user.teamId.toString());
  }

  @Get('clicks/my-team')
  @ApiOperation({ summary: 'Get current user team platform clicks' })
  @ApiResponse({ status: 200, description: 'Team platform clicks' })
  async getMyTeamPlatformClicks(@Request() req: any) {
    // Get user's team ID from the request
    const user = await this.platformsService['userModel'].findById(req.user.userId);
    if (!user || !user.teamId) {
      return [];
    }
    return await this.platformsService.getTeamPlatformClicks(user.teamId.toString());
  }
} 