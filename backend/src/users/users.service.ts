import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  async findById(id: string): Promise<UserDocument> {
    const user = await this.userModel.findById(id).populate('teamId');
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async findByEmail(email: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ email }).populate('teamId');
  }

  async findByTeamId(teamId: string): Promise<UserDocument[]> {
    console.log('🔍 UsersService.findByTeamId:');
    console.log('  Input teamId:', teamId);
    console.log('  Input teamId type:', typeof teamId);
    
    const objectId = new Types.ObjectId(teamId);
    console.log('  Converted to ObjectId:', objectId);
    
    const users = await this.userModel.find({ teamId: objectId }).populate('teamId');
    console.log('  Query result count:', users.length);
    
    return users;
  }

  async updateLastLogin(userId: string): Promise<void> {
    await this.userModel.findByIdAndUpdate(userId, { lastLoginAt: new Date() });
  }
} 