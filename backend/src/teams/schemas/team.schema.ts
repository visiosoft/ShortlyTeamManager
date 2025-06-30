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
}

export const TeamSchema = SchemaFactory.createForClass(Team); 