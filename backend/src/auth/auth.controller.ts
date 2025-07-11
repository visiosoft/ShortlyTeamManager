import { Controller, Post, Body, UseGuards, Request, Get, Res, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { CreateTeamMemberDto } from './dto/create-team-member.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { AuthGuard } from '@nestjs/passport';
import { Response } from 'express';

@Controller()
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('auth/register')
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('auth/login')
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('auth/register-with-referral')
  async registerWithReferral(@Body() registerDto: any) {
    return this.authService.registerWithReferral(registerDto);
  }

  @UseGuards(JwtAuthGuard)
  @Post('auth/team-member')
  async createTeamMember(@Body() createTeamMemberDto: CreateTeamMemberDto, @Request() req) {
    return this.authService.createTeamMember(createTeamMemberDto, req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Get('auth/profile')
  getProfile(@Request() req) {
    return req.user;
  }

  @Get('auth/google')
  @UseGuards(AuthGuard('google'))
  async googleAuth() {
    // This will redirect to Google OAuth
  }

  @Get('auth/google/callback')
  @UseGuards(AuthGuard('google'))
  async googleAuthRedirect(@Request() req, @Res() res: Response) {
    try {
      const result = await this.authService.googleLogin(req.user);
      
      // Redirect to frontend with token and user data
      const queryParams = new URLSearchParams({
        token: result.access_token,
        user: JSON.stringify(result.user),
      });
      
      res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/auth/callback?${queryParams.toString()}`);
    } catch (error) {
      console.error('Google OAuth error:', error);
      res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/login?error=google_auth_failed`);
    }
  }
} 