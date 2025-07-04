import { Controller, Get, Post, Put, Body, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { PaymentsService } from './payments.service';
import { CreatePaymentInfoDto } from './dto/create-payment-info.dto';
import { UpdatePaymentInfoDto } from './dto/update-payment-info.dto';
import { ProcessPayoutDto } from './dto/process-payout.dto';

@Controller('payments')
@UseGuards(JwtAuthGuard)
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  // User endpoints (for all authenticated users)
  @Post('payment-info')
  async createPaymentInfo(@Request() req, @Body() createPaymentInfoDto: CreatePaymentInfoDto) {
    return this.paymentsService.createPaymentInfo(req.user.userId, req.user.teamId, createPaymentInfoDto);
  }

  @Get('payment-info')
  async getPaymentInfo(@Request() req) {
    return this.paymentsService.getPaymentInfo(req.user.userId);
  }

  @Put('payment-info')
  async updatePaymentInfo(@Request() req, @Body() updatePaymentInfoDto: UpdatePaymentInfoDto) {
    return this.paymentsService.updatePaymentInfo(req.user.userId, updatePaymentInfoDto);
  }

  @Get('payouts')
  async getPayoutsByUser(@Request() req) {
    return this.paymentsService.getPayoutsByUser(req.user.userId);
  }

  // Admin endpoints - View team members' payment info for payout processing
  @Get('admin/team-payment-info')
  @UseGuards(RolesGuard)
  @Roles('admin')
  async getTeamPaymentInfo(@Request() req) {
    return this.paymentsService.getTeamPaymentInfo(req.user.teamId);
  }

  @Get('admin/eligible-payouts')
  @UseGuards(RolesGuard)
  @Roles('admin')
  async getEligiblePayouts() {
    return this.paymentsService.getEligiblePayouts();
  }

  @Post('admin/process-payout')
  @UseGuards(RolesGuard)
  @Roles('admin')
  async processPayout(@Request() req, @Body() processPayoutDto: ProcessPayoutDto) {
    return this.paymentsService.processPayout(req.user.userId, processPayoutDto);
  }

  @Get('admin/payouts')
  @UseGuards(RolesGuard)
  @Roles('admin')
  async getAllPayouts() {
    return this.paymentsService.getAllPayouts();
  }
} 