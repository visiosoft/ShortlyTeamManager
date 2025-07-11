import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { UrlsModule } from './urls/urls.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { TeamsModule } from './teams/teams.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { PaymentsModule } from './payments/payments.module';
import { ReferralsModule } from './referrals/referrals.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_URI'),
        dbName: configService.get<string>('DB_NAME'),
      }),
      inject: [ConfigService],
    }),
    UrlsModule,
    AuthModule,
    UsersModule,
    TeamsModule,
    AnalyticsModule,
    PaymentsModule,
    ReferralsModule,
  ],
})
export class AppModule {} 