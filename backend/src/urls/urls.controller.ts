import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  Res,
  HttpStatus,
  HttpCode,
  UseGuards,
  Request,
  Delete,
} from '@nestjs/common';
import { Response } from 'express';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { UrlsService } from './urls.service';
import { CreateUrlDto } from './dto/create-url.dto';
import { CreateAdminUrlDto } from './dto/create-admin-url.dto';
import { UrlResponseDto } from './dto/url-response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('urls')
@Controller()
export class UrlsController {
  constructor(private readonly urlsService: UrlsService) {}

  @Post('urls')
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new short URL' })
  @ApiResponse({
    status: 201,
    description: 'URL created successfully',
    type: UrlResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid URL provided' })
  @ApiResponse({ status: 409, description: 'Custom short code already taken' })
  async createUrl(
    @Body() createUrlDto: CreateUrlDto,
    @Request() req,
  ): Promise<UrlResponseDto> {
    return this.urlsService.createUrl(createUrlDto, req.user.userId, req.user.teamId);
  }

  @Post('urls/admin')
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a URL for a user (Admin only)' })
  @ApiResponse({
    status: 201,
    description: 'URL created successfully for user',
    type: UrlResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid URL provided' })
  @ApiResponse({ status: 403, description: 'Admin access required' })
  @ApiResponse({ status: 409, description: 'Custom short code already taken' })
  async createAdminUrl(
    @Body() createAdminUrlDto: CreateAdminUrlDto,
    @Request() req,
  ): Promise<UrlResponseDto> {
    return this.urlsService.createAdminUrl(createAdminUrlDto, req.user.userId, req.user.teamId);
  }

  @Get('urls/my-urls')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user URLs with pagination' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({
    status: 200,
    description: 'URLs retrieved successfully',
  })
  async findMyUrls(
    @Request() req,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    return this.urlsService.findAllByUser(req.user.userId, req.user.teamId, page, limit);
  }

  @Get('urls/team-urls')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all team URLs with pagination (Admin only)' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({
    status: 200,
    description: 'Team URLs retrieved successfully',
  })
  async findTeamUrls(
    @Request() req,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    return this.urlsService.findAllByTeam(req.user.teamId, page, limit);
  }

  @Get('urls/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get URL by ID' })
  @ApiResponse({
    status: 200,
    description: 'URL retrieved successfully',
    type: UrlResponseDto,
  })
  @ApiResponse({ status: 404, description: 'URL not found' })
  async findOne(
    @Param('id') id: string,
    @Request() req,
  ): Promise<UrlResponseDto> {
    return this.urlsService.findOne(id, req.user.teamId);
  }

  @Delete('urls/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Deactivate URL by ID' })
  @ApiResponse({
    status: 200,
    description: 'URL deactivated successfully',
  })
  @ApiResponse({ status: 403, description: 'Permission denied' })
  @ApiResponse({ status: 404, description: 'URL not found' })
  async deactivateUrl(
    @Param('id') id: string,
    @Request() req,
  ): Promise<void> {
    return this.urlsService.deactivateUrl(id, req.user.teamId, req.user.userId, req.user.role);
  }

  @Get(':shortCode')
  @ApiOperation({ summary: 'Redirect to original URL' })
  @ApiResponse({ status: 302, description: 'Redirect to original URL' })
  @ApiResponse({ status: 404, description: 'URL not found' })
  async redirect(
    @Param('shortCode') shortCode: string,
    @Res() res: Response,
    @Request() req,
  ): Promise<void> {
    const url = await this.urlsService.findByShortCode(shortCode);
    
    // Get IP address and user agent
    const ipAddress = req.ip || req.connection.remoteAddress || req.socket.remoteAddress;
    const userAgent = req.get('User-Agent');
    const referer = req.get('Referer');
    
    await this.urlsService.incrementClicks(shortCode, ipAddress, userAgent, referer);
    res.redirect(url.originalUrl);
  }

  @Get('urls/user/:userId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all URLs for a specific user (Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'User URLs retrieved successfully',
  })
  async findUserUrls(
    @Param('userId') userId: string,
    @Request() req,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 100,
  ) {
    return this.urlsService.findAllByUser(userId, req.user.teamId, page, limit);
  }

  @Post('urls/:id/regenerate')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Regenerate short URL code (Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'Short URL regenerated successfully',
    type: UrlResponseDto,
  })
  @ApiResponse({ status: 403, description: 'Admin access required' })
  @ApiResponse({ status: 404, description: 'URL not found' })
  async regenerateShortUrl(
    @Param('id') id: string,
    @Request() req,
  ): Promise<UrlResponseDto> {
    return this.urlsService.regenerateShortUrl(id, req.user.teamId);
  }
} 