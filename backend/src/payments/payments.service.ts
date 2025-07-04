import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { PaymentInfo, PaymentInfoDocument } from './schemas/payment-info.schema';
import { Payout, PayoutDocument } from './schemas/payout.schema';
import { CreatePaymentInfoDto } from './dto/create-payment-info.dto';
import { UpdatePaymentInfoDto } from './dto/update-payment-info.dto';
import { ProcessPayoutDto } from './dto/process-payout.dto';
import { TeamsService } from '../teams/teams.service';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectModel(PaymentInfo.name) private paymentInfoModel: Model<PaymentInfoDocument>,
    @InjectModel(Payout.name) private payoutModel: Model<PayoutDocument>,
    private teamsService: TeamsService,
  ) {}

  async createPaymentInfo(userId: string, teamId: string, createPaymentInfoDto: CreatePaymentInfoDto) {
    // Check if payment info already exists
    const existingPaymentInfo = await this.paymentInfoModel.findOne({ userId: new Types.ObjectId(userId) });
    if (existingPaymentInfo) {
      throw new BadRequestException('Payment information already exists for this user');
    }

    // Set default threshold amount if not provided
    const paymentData = {
      ...createPaymentInfoDto,
      thresholdAmount: createPaymentInfoDto.thresholdAmount || 1000, // Default to 1000 if not provided
    };

    const paymentInfo = new this.paymentInfoModel({
      userId: new Types.ObjectId(userId),
      teamId: new Types.ObjectId(teamId),
      ...paymentData,
    });

    return paymentInfo.save();
  }

  async getPaymentInfo(userId: string) {
    const paymentInfo = await this.paymentInfoModel.findOne({ userId: new Types.ObjectId(userId) });
    if (!paymentInfo) {
      throw new NotFoundException('Payment information not found');
    }
    return paymentInfo;
  }

  async updatePaymentInfo(userId: string, updatePaymentInfoDto: UpdatePaymentInfoDto) {
    // Get existing payment info to preserve thresholdAmount if not provided
    const existingPaymentInfo = await this.paymentInfoModel.findOne({ userId: new Types.ObjectId(userId) });
    if (!existingPaymentInfo) {
      throw new NotFoundException('Payment information not found');
    }

    // Preserve existing thresholdAmount if not provided in update
    const updateData = {
      ...updatePaymentInfoDto,
      thresholdAmount: updatePaymentInfoDto.thresholdAmount !== undefined 
        ? updatePaymentInfoDto.thresholdAmount 
        : existingPaymentInfo.thresholdAmount,
    };

    const paymentInfo = await this.paymentInfoModel.findOneAndUpdate(
      { userId: new Types.ObjectId(userId) },
      { $set: updateData },
      { new: true }
    );

    return paymentInfo;
  }

  async getAllPaymentInfo() {
    return this.paymentInfoModel.find()
      .populate('userId', 'firstName lastName email')
      .populate('teamId', 'name')
      .exec();
  }

  async getTeamPaymentInfo(teamId: string) {
    return this.paymentInfoModel.find({ teamId: new Types.ObjectId(teamId) })
      .populate('userId', 'firstName lastName email')
      .populate('teamId', 'name')
      .exec();
  }

  async getEligiblePayouts() {
    return this.paymentInfoModel.find({ isEligibleForPayout: true })
      .populate('userId', 'firstName lastName email')
      .populate('teamId', 'name')
      .exec();
  }

  async processPayout(adminId: string, processPayoutDto: ProcessPayoutDto) {
    const { userId, period, amount, notes, transactionId } = processPayoutDto;

    // Check if payment info exists
    const paymentInfo = await this.paymentInfoModel.findOne({ userId: new Types.ObjectId(userId) });
    if (!paymentInfo) {
      throw new NotFoundException('Payment information not found');
    }

    // Check if payout already exists for this period
    const existingPayout = await this.payoutModel.findOne({
      userId: new Types.ObjectId(userId),
      period,
    });

    if (existingPayout) {
      throw new BadRequestException(`Payout for period ${period} already exists`);
    }

    // Create payout record
    const payout = new this.payoutModel({
      userId: new Types.ObjectId(userId),
      teamId: paymentInfo.teamId,
      paymentInfoId: paymentInfo._id,
      amount,
      currency: paymentInfo.currency,
      period,
      status: 'processed',
      processedBy: new Types.ObjectId(adminId),
      processedAt: new Date(),
      notes,
      transactionId,
      isPaid: true,
      paidAt: new Date(),
    });

    // Update payment info
    paymentInfo.paidAmount += amount;
    paymentInfo.pendingAmount = Math.max(0, paymentInfo.totalEarnings - paymentInfo.paidAmount);
    paymentInfo.isEligibleForPayout = paymentInfo.pendingAmount >= paymentInfo.thresholdAmount;
    paymentInfo.lastPayoutDate = new Date();
    paymentInfo.lastPayoutAmount = amount;

    await paymentInfo.save();
    return payout.save();
  }

  async getPayoutsByUser(userId: string) {
    return this.payoutModel.find({ userId: new Types.ObjectId(userId) })
      .sort({ createdAt: -1 })
      .exec();
  }

  async getAllPayouts() {
    return this.payoutModel.find()
      .populate('userId', 'firstName lastName email')
      .populate('teamId', 'name')
      .populate('processedBy', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .exec();
  }

  async updateEarnings(userId: string, teamId: string) {
    // Get total clicks for the user
    const totalClicks = await this.getUserTotalClicks(userId, teamId);
    
    // Calculate earnings
    const earnings = await this.teamsService.calculateUserEarnings(userId, teamId, totalClicks);
    
    // Update payment info
    const paymentInfo = await this.paymentInfoModel.findOne({ userId: new Types.ObjectId(userId) });
    if (paymentInfo) {
      paymentInfo.totalEarnings = earnings.totalEarnings;
      paymentInfo.pendingAmount = Math.max(0, earnings.totalEarnings - paymentInfo.paidAmount);
      paymentInfo.isEligibleForPayout = paymentInfo.pendingAmount >= paymentInfo.thresholdAmount;
      await paymentInfo.save();
    }

    return earnings;
  }

  private async getUserTotalClicks(userId: string, teamId: string): Promise<number> {
    // Get total clicks for URLs created by this user
    const { default: mongoose } = await import('mongoose');
    const UrlModel = mongoose.model('Url');
    
    const result = await UrlModel.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(userId) } },
      { $group: { _id: null, totalClicks: { $sum: '$clicks' } } }
    ]);
    
    return result.length > 0 ? result[0].totalClicks : 0;
  }
} 