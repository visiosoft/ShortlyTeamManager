import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type UrlDocument = Url & Document & {
  createdAt: Date;
  updatedAt: Date;
};

@Schema({ timestamps: true })
export class Url {
  @Prop({ required: true })
  originalUrl: string;

  @Prop({ required: true, unique: true, index: true })
  shortCode: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Team', required: true })
  teamId: Types.ObjectId;

  @Prop({ default: 0 })
  clicks: number;

  @Prop({ default: true })
  isActive: boolean;

  @Prop()
  title?: string;

  @Prop()
  description?: string;

  @Prop({ default: false })
  isAdminCreated: boolean;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  createdByAdmin?: Types.ObjectId;
}

export const UrlSchema = SchemaFactory.createForClass(Url); 