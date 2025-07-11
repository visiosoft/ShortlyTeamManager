import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AnalyticsService } from './analytics.service';
import { AnalyticsController } from './analytics.controller';
import { ClickAnalytics, ClickAnalyticsSchema } from './schemas/click-analytics.schema';
import { ReferralsModule } from '../referrals/referrals.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: ClickAnalytics.name, schema: ClickAnalyticsSchema }]),
    ReferralsModule,
  ],
  controllers: [AnalyticsController],
  providers: [AnalyticsService],
  exports: [AnalyticsService],
})
export class AnalyticsModule {} 