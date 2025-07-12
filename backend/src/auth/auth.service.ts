import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import { User, UserDocument } from '../users/schemas/user.schema';
import { Team, TeamDocument } from '../teams/schemas/team.schema';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { CreateTeamDto } from '../teams/dto/create-team.dto';
import { ReferralsService } from '../referrals/referrals.service';
import { UrlsService } from '../urls/urls.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Team.name) private teamModel: Model<TeamDocument>,
    private jwtService: JwtService,
    private referralsService: ReferralsService,
    private urlsService: UrlsService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.userModel.findOne({ email }).populate('teamId');
    if (user && await bcrypt.compare(password, user.password)) {
      const { password, ...result } = user.toObject();
      return result;
    }
    return null;
  }

  async login(loginDto: LoginDto) {
    const user = await this.validateUser(loginDto.email, loginDto.password);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Update last login
    await this.userModel.findByIdAndUpdate(user._id, { lastLoginAt: new Date() });

    const payload = { 
      email: user.email, 
      sub: user._id, 
      teamId: user.teamId._id,
      role: user.role 
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        teamId: user.teamId._id,
        team: user.teamId,
      },
    };
  }

  async register(registerDto: RegisterDto) {
    const { email, password, firstName, lastName, teamName, teamDescription } = registerDto;

    // Check if user already exists
    const existingUser = await this.userModel.findOne({ email });
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Create team
    const team = new this.teamModel({
      name: teamName,
      description: teamDescription,
    });
    const savedTeam = await team.save();

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = new this.userModel({
      email,
      password: hashedPassword,
      firstName,
      lastName,
      teamId: savedTeam._id,
      role: 'admin', // First user in team is admin
    });

    const savedUser = await user.save();

    // Generate unique referral code for the user
    await this.referralsService.generateUserReferralCode(savedUser._id.toString());

    // Assign default URLs to the new user
    try {
      // LOGGING: Print userId and teamId before assignment
      console.log(`[register] Assigning default URLs to userId: ${savedUser._id}, teamId: ${savedTeam._id}`);
      const assignedUrls = await this.urlsService.assignDefaultUrlsToNewUser(savedUser._id.toString(), savedTeam._id.toString());
      console.log(`[register] Assignment completed. Assigned ${assignedUrls.length} URLs to new user.`);
    } catch (error) {
      console.error('Failed to assign default URLs to new user:', error);
      // Don't fail registration if default URL assignment fails
    }

    // Reload the user to get the updated referral code
    const updatedUser = await this.userModel.findById(savedUser._id);

    const payload = { 
      email: updatedUser.email, 
      sub: updatedUser._id, 
      teamId: savedTeam._id,
      role: updatedUser.role 
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: updatedUser._id,
        email: updatedUser.email,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        role: updatedUser.role,
        teamId: savedTeam._id,
        team: savedTeam,
        referralCode: updatedUser.referralCode,
      },
    };
  }

  async registerWithReferral(registerDto: any) {
    const { email, password, firstName, lastName, referralCode } = registerDto;

    // Check if user already exists
    const existingUser = await this.userModel.findOne({ email });
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Validate referral code and get the referring team or user
    let referringTeam = null;
    let referringUser = null;
    
    if (referralCode) {
      try {
        // First try to find a user with this referral code
        referringUser = await this.referralsService.getUserByReferralCode(referralCode);
        // Get the team from the referring user
        referringTeam = await this.teamModel.findById(referringUser.teamId);
      } catch (error) {
        // If no user found, try to find a team with this referral code
        try {
          referringTeam = await this.referralsService.getTeamByReferralCode(referralCode);
        } catch (teamError) {
          throw new ConflictException('Invalid referral code');
        }
      }
    } else {
      throw new ConflictException('Referral code is required for this registration method');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user as a member of the referring team (not admin)
    const user = new this.userModel({
      email,
      password: hashedPassword,
      firstName,
      lastName,
      teamId: referringTeam._id,
      role: 'user', // User joins as regular member, not admin
      referredBy: referringTeam._id, // Track who referred this user
    });

    const savedUser = await user.save();

    // Generate unique referral code for the new user
    await this.referralsService.generateUserReferralCode(savedUser._id.toString());

    // Assign default URLs to the new user
    try {
      await this.urlsService.assignDefaultUrlsToNewUser(savedUser._id.toString(), referringTeam._id.toString());
    } catch (error) {
      console.error('Failed to assign default URLs to new user:', error);
      // Don't fail registration if default URL assignment fails
    }

    // Reload the user to get the updated referral code
    const updatedUser = await this.userModel.findById(savedUser._id);

    // Process referral bonuses
    try {
      console.log(`Processing referral signup for user ${savedUser._id} with referral code ${referralCode}`);
      console.log(`User ID type: ${typeof savedUser._id}, User ID value: ${savedUser._id}`);
      console.log(`Referral code type: ${typeof referralCode}, Referral code value: ${referralCode}`);
      
      await this.referralsService.processReferralSignup(
        savedUser._id.toString(),
        referralCode,
        1000, // Signup bonus
        500   // Referral bonus
      );
      console.log('Referral processing completed successfully');
    } catch (error) {
      console.error('Referral processing failed:', error);
      console.error('Error details:', error.message);
      console.error('Error stack:', error.stack);
      // Don't fail registration if referral processing fails
    }

    const payload = { 
      email: updatedUser.email, 
      sub: updatedUser._id, 
      teamId: referringTeam._id,
      role: updatedUser.role 
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: updatedUser._id,
        email: updatedUser.email,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        role: updatedUser.role,
        teamId: referringTeam._id,
        team: referringTeam,
        referralCode: updatedUser.referralCode,
      },
    };
  }

  async createTeamMember(createTeamMemberDto: any, adminUser: any) {
    const { email, password, firstName, lastName, role = 'user' } = createTeamMemberDto;

    // Check if user already exists
    const existingUser = await this.userModel.findOne({ email });
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user in the same team
    const user = new this.userModel({
      email,
      password: hashedPassword,
      firstName,
      lastName,
      teamId: Types.ObjectId.createFromHexString(adminUser.teamId),
      role,
    });

    const savedUser = await user.save();

    // Generate unique referral code for the new team member
    await this.referralsService.generateUserReferralCode(savedUser._id.toString());

    // Reload the user to get the updated referral code
    const updatedUser = await this.userModel.findById(savedUser._id);

    return {
      id: updatedUser._id,
      email: updatedUser.email,
      firstName: updatedUser.firstName,
      lastName: updatedUser.lastName,
      role: updatedUser.role,
      referralCode: updatedUser.referralCode,
    };
  }

  async validateGoogleUser(profile: any): Promise<any> {
    const { email, firstName, lastName, googleId } = profile;
    
    // Check if user exists with this Google ID
    let user = await this.userModel.findOne({ googleId }).populate('teamId');
    
    if (!user) {
      // Check if user exists with this email
      user = await this.userModel.findOne({ email }).populate('teamId');
      
      if (user) {
        // User exists but doesn't have Google ID, update it
        user.googleId = googleId;
        await user.save();
      } else {
        // Create new user with Google OAuth (only for regular users, not admins)
        // Find a default team or create one for Google users
        let defaultTeam = await this.teamModel.findOne({ name: 'Google Users' });
        
        if (!defaultTeam) {
          defaultTeam = new this.teamModel({
            name: 'Google Users',
            description: 'Default team for Google OAuth users',
          });
          await defaultTeam.save();
        }

        user = new this.userModel({
          email,
          firstName,
          lastName,
          googleId,
          teamId: defaultTeam._id,
          role: 'user', // Google users are always regular users, not admins
          isEmailVerified: true, // Google emails are verified
        });
        
        await user.save();
        
        // Generate unique referral code for the new Google user
        await this.referralsService.generateUserReferralCode(user._id.toString());
        
        user = await this.userModel.findById(user._id).populate('teamId');
      }
    }

    // Update last login
    await this.userModel.findByIdAndUpdate(user._id, { lastLoginAt: new Date() });

    const { password, ...result } = user.toObject();
    return result;
  }

  async googleLogin(profile: any) {
    const user = await this.validateGoogleUser(profile);
    
    const payload = { 
      email: user.email, 
      sub: user._id, 
      teamId: user.teamId._id,
      role: user.role 
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        teamId: user.teamId._id,
        team: user.teamId,
      },
    };
  }
} 