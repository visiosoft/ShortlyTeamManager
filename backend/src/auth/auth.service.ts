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

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Team.name) private teamModel: Model<TeamDocument>,
    private jwtService: JwtService,
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

    const payload = { 
      email: savedUser.email, 
      sub: savedUser._id, 
      teamId: savedTeam._id,
      role: savedUser.role 
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: savedUser._id,
        email: savedUser.email,
        firstName: savedUser.firstName,
        lastName: savedUser.lastName,
        role: savedUser.role,
        team: savedTeam,
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

    return {
      id: savedUser._id,
      email: savedUser.email,
      firstName: savedUser.firstName,
      lastName: savedUser.lastName,
      role: savedUser.role,
    };
  }
} 