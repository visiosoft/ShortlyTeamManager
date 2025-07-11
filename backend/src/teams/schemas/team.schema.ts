import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type TeamDocument = Team & Document & {
  createdAt: Date;
  updatedAt: Date;
};

interface RewardTier {
  clicks: number;
  amount: number;
  currency: string;
}

// Create a subdocument schema for referral bonuses (same as User schema)
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
  type: string; // 'team_bonus' or other types
}

@Schema({ timestamps: true })
export class Team {
  @Prop({ required: true })
  name: string;

  @Prop()
  description?: string;

  @Prop({ type: [{ clicks: Number, amount: Number, currency: String }], default: [] })
  rewards: RewardTier[];

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ default: 0 })
  urlCount: number;

  @Prop({ default: 0 })
  totalClicks: number;

  // Referral system fields
  @Prop({ unique: true, sparse: true })
  referralCode: string;

  @Prop({ default: 0 })
  totalReferrals: number;

  @Prop({ default: 0 })
  totalReferralEarnings: number;

  @Prop({ type: [ReferralBonus], default: [] })
  referralBonuses: ReferralBonus[];
}

export const TeamSchema = SchemaFactory.createForClass(Team); 