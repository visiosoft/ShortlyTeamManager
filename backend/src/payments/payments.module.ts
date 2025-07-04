import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { PaymentInfo, PaymentInfoSchema } from './schemas/payment-info.schema';
import { Payout, PayoutSchema } from './schemas/payout.schema';
import { TeamsModule } from '../teams/teams.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: PaymentInfo.name, schema: PaymentInfoSchema },
      { name: Payout.name, schema: PayoutSchema },
    ]),
    TeamsModule,
  ],
  controllers: [PaymentsController],
  providers: [PaymentsService],
  exports: [PaymentsService],
})
export class PaymentsModule {} 