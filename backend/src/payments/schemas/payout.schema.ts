import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type PayoutDocument = Payout & Document & {
  createdAt: Date;
  updatedAt: Date;
};

@Schema({ timestamps: true })
export class Payout {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Team', required: true })
  teamId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'PaymentInfo', required: true })
  paymentInfoId: Types.ObjectId;

  @Prop({ required: true })
  amount: number;

  @Prop({ required: true })
  currency: string;

  @Prop({ required: true })
  period: string; // e.g., "2024-01", "2024-02"

  @Prop({ default: 'pending' })
  status: 'pending' | 'processed' | 'failed' | 'cancelled';

  @Prop()
  processedBy?: Types.ObjectId; // Admin who processed the payout

  @Prop()
  processedAt?: Date;

  @Prop()
  notes?: string;

  @Prop()
  transactionId?: string;

  @Prop({ default: false })
  isPaid: boolean;

  @Prop()
  paidAt?: Date;
}

export const PayoutSchema = SchemaFactory.createForClass(Payout); 