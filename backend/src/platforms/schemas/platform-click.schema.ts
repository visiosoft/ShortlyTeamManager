import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type PlatformClickDocument = PlatformClick & Document;

@Schema({ timestamps: true })
export class PlatformClick {
  @Prop({ type: Types.ObjectId, ref: 'Platform', required: true })
  platformId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Team', required: true })
  teamId: Types.ObjectId;

  @Prop({ required: true })
  clicks: number;

  @Prop({ required: true })
  date: Date;

  @Prop({ type: Number, default: 0 })
  earnings: number;

  @Prop({ type: String, default: 'PKR' })
  currency: string;

  @Prop({ type: Number, default: 0 })
  ratePerClick: number;

  @Prop({ type: String })
  notes?: string;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  addedBy: Types.ObjectId; // Admin who added the clicks

  @Prop({ type: Date, default: Date.now })
  createdAt: Date;

  @Prop({ type: Date, default: Date.now })
  updatedAt: Date;
}

export const PlatformClickSchema = SchemaFactory.createForClass(PlatformClick);

// Index for efficient queries
PlatformClickSchema.index({ platformId: 1, userId: 1, date: 1 });
PlatformClickSchema.index({ teamId: 1, date: 1 });
PlatformClickSchema.index({ userId: 1, date: 1 }); 