import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ClickAnalyticsDocument = ClickAnalytics & Document & {
  createdAt: Date;
  updatedAt: Date;
};

@Schema({ timestamps: true })
export class ClickAnalytics {
  @Prop({ type: Types.ObjectId, ref: 'Url', required: true })
  urlId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Team', required: true })
  teamId: Types.ObjectId;

  @Prop({ required: true })
  ipAddress: string;

  @Prop()
  userAgent?: string;

  @Prop()
  referer?: string;

  @Prop()
  country?: string;

  @Prop()
  city?: string;

  @Prop()
  browser?: string;

  @Prop()
  os?: string;

  @Prop()
  device?: string;
}

export const ClickAnalyticsSchema = SchemaFactory.createForClass(ClickAnalytics); 