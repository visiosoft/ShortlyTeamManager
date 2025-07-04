import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type PaymentInfoDocument = PaymentInfo & Document & {
  createdAt: Date;
  updatedAt: Date;
};

@Schema({ timestamps: true })
export class PaymentInfo {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, unique: true })
  userId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Team', required: true })
  teamId: Types.ObjectId;

  @Prop({ required: true })
  bankName: string;

  @Prop({ required: true })
  accountNumber: string;

  @Prop({ required: true })
  accountHolderName: string;

  @Prop()
  branchCode?: string;

  @Prop()
  swiftCode?: string;

  @Prop()
  iban?: string;

  @Prop({ default: 'PKR' })
  currency: string;

  @Prop({ default: false })
  isVerified: boolean;

  @Prop()
  verificationNotes?: string;

  @Prop({ default: 0 })
  totalEarnings: number;

  @Prop({ default: 0 })
  paidAmount: number;

  @Prop({ default: 0 })
  pendingAmount: number;

  @Prop({ default: 0 })
  thresholdAmount: number;

  @Prop({ default: false })
  isEligibleForPayout: boolean;

  @Prop()
  lastPayoutDate?: Date;

  @Prop()
  lastPayoutAmount?: number;
}

export const PaymentInfoSchema = SchemaFactory.createForClass(PaymentInfo); 