import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type UserDocument = User & Document & {
  createdAt: Date;
  updatedAt: Date;
};

// Create a subdocument schema for referral bonuses
@Schema({ _id: false })
export class ReferralBonus {
  @Prop({ type: Types.ObjectId, required: true })
  userId: Types.ObjectId;

  @Prop({ required: true })
  amount: number;

  @Prop({ required: true, default: 'PKR' })
  currency: string;

  @Prop({ required: true, default: Date.now })
  createdAt: Date;

  @Prop({ required: true })
  type: string; // 'signup_bonus' or 'referral_bonus'
}

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true })
  firstName: string;

  @Prop({ required: true })
  lastName: string;

  @Prop({ required: true, unique: true, index: true })
  email: string;

  @Prop({ required: function() { return !this.googleId; } })
  password: string;

  @Prop({ type: Types.ObjectId, ref: 'Team', required: true })
  teamId: Types.ObjectId;

  @Prop({ unique: true, sparse: true })
  googleId?: string;

  @Prop({ default: 'user' })
  role: 'admin' | 'user';

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ default: false })
  isEmailVerified: boolean;

  @Prop()
  lastLoginAt?: Date;

  // Referral system fields
  @Prop({ type: Types.ObjectId, ref: 'Team', sparse: true })
  referredBy?: Types.ObjectId;

  @Prop({ unique: true, sparse: true })
  referralCode?: string;

  @Prop({ default: 0 })
  totalReferrals: number;

  @Prop({ default: 0 })
  totalReferralEarnings: number;

  @Prop({ type: [ReferralBonus], default: [] })
  referralBonuses: ReferralBonus[];
}

export const UserSchema = SchemaFactory.createForClass(User); 