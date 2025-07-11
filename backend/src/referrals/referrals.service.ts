import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User, UserDocument } from '../users/schemas/user.schema';
import { Team, TeamDocument } from '../teams/schemas/team.schema';
import * as nanoid from 'nanoid';

@Injectable()
export class ReferralsService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Team.name) private teamModel: Model<TeamDocument>,
  ) {}

  async generateUserReferralCode(userId: string): Promise<string> {
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Generate a unique 8-character referral code
    let referralCode: string;
    let isUnique = false;
    
    while (!isUnique) {
      referralCode = nanoid.nanoid(8).toUpperCase();
      const existingUser = await this.userModel.findOne({ referralCode });
      if (!existingUser) {
        isUnique = true;
      }
    }

    // Update user with referral code
    await this.userModel.findByIdAndUpdate(userId, { referralCode });
    
    return referralCode;
  }

  async getUserReferralCode(userId: string): Promise<string> {
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (!user.referralCode) {
      return await this.generateUserReferralCode(userId);
    }

    return user.referralCode;
  }

  async getUserReferralLink(userId: string): Promise<string> {
    const referralCode = await this.getUserReferralCode(userId);
    const baseUrl = process.env.FRONTEND_URL || 'https://shorly.uk';
    return `${baseUrl}/register?ref=${referralCode}`;
  }

  async getUserByReferralCode(referralCode: string): Promise<any> {
    console.log(`Looking for user with referral code: ${referralCode}`);
    const user = await this.userModel.findOne({ referralCode });
    if (!user) {
      console.log(`No user found with referral code: ${referralCode}`);
      throw new NotFoundException('Invalid referral code');
    }
    console.log(`Found user: ${user.email} with referral code: ${user.referralCode}`);
    return user;
  }

  async validateReferralCode(referralCode: string): Promise<{ valid: boolean; message: string; user?: any; team?: any }> {
    console.log(`Validating referral code: ${referralCode}`);
    
    // First try to find a user with this referral code
    const user = await this.userModel.findOne({ referralCode });
    if (user) {
      console.log(`Found user with referral code: ${user.email}`);
      return {
        valid: true,
        message: 'Valid user referral code',
        user
      };
    }

    // Then try to find a team with this referral code
    const team = await this.teamModel.findOne({ referralCode });
    if (team) {
      console.log(`Found team with referral code: ${team.name}`);
      return {
        valid: true,
        message: 'Valid team referral code',
        team
      };
    }

    console.log(`No user or team found with referral code: ${referralCode}`);
    return {
      valid: false,
      message: 'Invalid referral code'
    };
  }

  // Keep team-based methods for backward compatibility
  async generateReferralCode(teamId: string): Promise<string> {
    const team = await this.teamModel.findById(teamId);
    if (!team) {
      throw new NotFoundException('Team not found');
    }

    // Generate a unique 8-character referral code
    let referralCode: string;
    let isUnique = false;
    
    while (!isUnique) {
      referralCode = nanoid.nanoid(8).toUpperCase();
      const existingTeam = await this.teamModel.findOne({ referralCode });
      if (!existingTeam) {
        isUnique = true;
      }
    }

    // Update team with referral code
    await this.teamModel.findByIdAndUpdate(teamId, { referralCode });
    
    return referralCode;
  }

  async getReferralCode(teamId: string): Promise<string> {
    const team = await this.teamModel.findById(teamId);
    if (!team) {
      throw new NotFoundException('Team not found');
    }

    if (!team.referralCode) {
      return await this.generateReferralCode(teamId);
    }

    return team.referralCode;
  }

  async getReferralLink(teamId: string): Promise<string> {
    const referralCode = await this.getReferralCode(teamId);
    const baseUrl = process.env.FRONTEND_URL || 'https://shorly.uk';
    return `${baseUrl}/register?ref=${referralCode}`;
  }

  async getTeamByReferralCode(referralCode: string): Promise<TeamDocument> {
    const team = await this.teamModel.findOne({ referralCode });
    if (!team) {
      throw new NotFoundException('Invalid referral code');
    }
    return team;
  }

  async processReferralSignup(
    userId: string,
    referralCode: string,
    signupBonus: number = 1000,
    referralBonus: number = 500
  ): Promise<void> {
    console.log(`processReferralSignup called with userId: ${userId}, referralCode: ${referralCode}`);
    
    // Try to find user by referral code first (individual referral)
    let referringUser = await this.getUserByReferralCode(referralCode).catch(() => null);
    let referringTeam = null;
    
    if (!referringUser) {
      // Fallback to team-based referral code
      try {
        referringTeam = await this.getTeamByReferralCode(referralCode);
        referringUser = await this.userModel.findOne({ 
          teamId: referringTeam._id, 
          role: 'admin' 
        });
      } catch (error) {
        throw new NotFoundException('Invalid referral code');
      }
    }
    
    if (!referringUser) {
      throw new NotFoundException('Invalid referral code or no referring user found');
    }

    const newUser = await this.userModel.findById(userId);
    if (!newUser) {
      throw new NotFoundException('User not found');
    }

    console.log(`Found referring user: ${referringUser.email} with teamId: ${referringUser.teamId}`);
    
    // Update new user with referral information
    console.log('Updating new user with referredBy:', referringUser.teamId);
    const updateUserResult = await this.userModel.findByIdAndUpdate(userId, {
      referredBy: referringUser.teamId,
    });
    console.log('Update user result:', updateUserResult);

    // Give signup bonus to the new user (only their personal bonus)
    console.log('Adding signup bonus to new user:', userId);
    const signupBonusResult = await this.userModel.findByIdAndUpdate(userId, {
      $inc: { totalReferralEarnings: signupBonus },
      $push: {
        referralBonuses: {
          userId: new Types.ObjectId(userId),
          amount: signupBonus,
          currency: 'PKR',
          createdAt: new Date(),
          type: 'signup_bonus'
        },
      },
    });
    console.log('Signup bonus update result:', signupBonusResult);

    // Give referral bonus to the referring user
    console.log('Adding referral bonus to referring user:', referringUser._id);
    const referralBonusResult = await this.userModel.findByIdAndUpdate(referringUser._id, {
      $inc: { 
        totalReferrals: 1,
        totalReferralEarnings: referralBonus 
      },
      $push: {
        referralBonuses: {
          userId: new Types.ObjectId(userId),
          amount: referralBonus,
          currency: 'PKR',
          createdAt: new Date(),
          type: 'referral_bonus'
        },
      },
    });
    console.log('Referral bonus update result:', referralBonusResult);

    // Update team referral stats (team gets both bonuses)
    const teamId = referringUser.teamId;
    console.log('Updating team with bonuses:', teamId);
    const teamBonusResult = await this.teamModel.findByIdAndUpdate(teamId, {
      $inc: { 
        totalReferrals: 1,
        totalReferralEarnings: signupBonus + referralBonus 
      },
      $push: {
        referralBonuses: {
          userId: new Types.ObjectId(userId),
          amount: signupBonus + referralBonus,
          currency: 'PKR',
          createdAt: new Date(),
          type: 'team_bonus'
        },
      },
    });
    console.log('Team bonus update result:', teamBonusResult);
  }

  async getReferralStats(teamId: string) {
    const team = await this.teamModel.findById(teamId);
    if (!team) {
      throw new NotFoundException('Team not found');
    }

    const referralLink = await this.getReferralLink(teamId);
    
    return {
      referralCode: team.referralCode,
      referralLink,
      totalReferrals: team.totalReferrals,
      totalReferralEarnings: team.totalReferralEarnings,
      referralBonuses: team.referralBonuses,
    };
  }

  async getUserReferralStats(userId: string) {
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const referralLink = await this.getUserReferralLink(userId);
    const referralCode = await this.getUserReferralCode(userId);

    return {
      totalReferrals: user.totalReferrals,
      totalReferralEarnings: user.totalReferralEarnings,
      referralBonuses: user.referralBonuses,
      referredBy: user.referredBy,
      referralLink,
      referralCode,
    };
  }

  async getReferralHistory(teamId: string) {
    const team = await this.teamModel.findById(teamId).populate('referralBonuses.userId', 'firstName lastName email');
    if (!team) {
      throw new NotFoundException('Team not found');
    }

    return team.referralBonuses;
  }

  async getUserReferralSignups(userId: string) {
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Ensure referralBonuses exists and is an array
    const referralBonuses = user.referralBonuses || [];
    
    // Get all referral bonuses for this user (referral_bonus type)
    const referralBonusList = referralBonuses.filter(bonus => bonus && bonus.type === 'referral_bonus');
    
    if (referralBonusList.length === 0) {
      return [];
    }
    
    // Get details of the users who were referred
    const referredUserIds = referralBonusList.map(bonus => bonus.userId);
    const referredUsers = await this.userModel.find({ 
      _id: { $in: referredUserIds } 
    }).select('firstName lastName email createdAt');

    // Map the data
    const referralSignups = referralBonusList.map(bonus => {
      const referredUser = referredUsers.find(u => u._id.toString() === bonus.userId.toString());
      return {
        id: bonus.userId,
        firstName: referredUser?.firstName || 'Unknown',
        lastName: referredUser?.lastName || 'User',
        email: referredUser?.email || 'unknown@email.com',
        bonusAmount: bonus.amount,
        currency: bonus.currency,
        createdAt: bonus.createdAt,
        referredAt: referredUser?.createdAt
      };
    });

    return referralSignups;
  }

  async processReferralEarningsFromClick(
    userId: string,
    clickAmount: number = 1
  ): Promise<void> {
    console.log(`Processing referral earnings from click for user: ${userId}, amount: ${clickAmount}`);
    
    const user = await this.userModel.findById(userId);
    if (!user) {
      console.log('User not found');
      return;
    }

    // If user was referred by someone, give earnings to both referrer and referred user
    if (user.referredBy) {
      console.log(`User was referred by team: ${user.referredBy}`);
      
      // Find the referring user (admin of the referring team)
      const referringUser = await this.userModel.findOne({ 
        teamId: user.referredBy, 
        role: 'admin' 
      });
      
      if (referringUser) {
        console.log(`Found referring user: ${referringUser.email}`);
        
        // Give earnings to the referring user
        const referrerEarnings = clickAmount * 0.1; // 10% of click value
        console.log(`Adding ${referrerEarnings} to referrer: ${referringUser._id}`);
        
        const referrerUpdateResult = await this.userModel.findByIdAndUpdate(referringUser._id, {
          $inc: { totalReferralEarnings: referrerEarnings },
          $push: {
            referralBonuses: {
              userId: new Types.ObjectId(userId),
              amount: referrerEarnings,
              currency: 'PKR',
              createdAt: new Date(),
              type: 'click_earnings'
            },
          },
        });
        console.log('Referrer earnings update result:', referrerUpdateResult);
        
        // Give earnings to the referred user
        const referredUserEarnings = clickAmount * 0.05; // 5% of click value
        console.log(`Adding ${referredUserEarnings} to referred user: ${userId}`);
        
        const referredUserUpdateResult = await this.userModel.findByIdAndUpdate(userId, {
          $inc: { totalReferralEarnings: referredUserEarnings },
          $push: {
            referralBonuses: {
              userId: new Types.ObjectId(userId),
              amount: referredUserEarnings,
              currency: 'PKR',
              createdAt: new Date(),
              type: 'click_earnings'
            },
          },
        });
        console.log('Referred user earnings update result:', referredUserUpdateResult);
        
        // Update team earnings
        const teamEarnings = clickAmount * 0.15; // 15% of click value (total)
        console.log(`Adding ${teamEarnings} to team: ${user.referredBy}`);
        
        const teamUpdateResult = await this.teamModel.findByIdAndUpdate(user.referredBy, {
          $inc: { totalReferralEarnings: teamEarnings },
          $push: {
            referralBonuses: {
              userId: new Types.ObjectId(userId),
              amount: teamEarnings,
              currency: 'PKR',
              createdAt: new Date(),
              type: 'click_earnings'
            },
          },
        });
        console.log('Team earnings update result:', teamUpdateResult);
      }
    } else {
      console.log('User was not referred by anyone');
    }
  }
} 