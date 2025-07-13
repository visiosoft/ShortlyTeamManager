import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type PlatformDocument = Platform & Document;

@Schema({ timestamps: true })
export class Platform {
  @Prop({ required: true, unique: true })
  name: string;

  @Prop({ required: true })
  description: string;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ type: String, default: 'external' })
  type: string; // 'external', 'internal', etc.

  @Prop({ type: String })
  website?: string;

  @Prop({ type: Date, default: Date.now })
  createdAt: Date;

  @Prop({ type: Date, default: Date.now })
  updatedAt: Date;
}

export const PlatformSchema = SchemaFactory.createForClass(Platform); 