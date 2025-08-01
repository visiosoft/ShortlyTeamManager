import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UrlsController } from './urls.controller';
import { UrlsService } from './urls.service';
import { Url, UrlSchema } from './schemas/url.schema';
import { Team, TeamSchema } from '../teams/schemas/team.schema';
import { AnalyticsModule } from '../analytics/analytics.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Url.name, schema: UrlSchema },
      { name: Team.name, schema: TeamSchema }
    ]),
    AnalyticsModule,
  ],
  controllers: [UrlsController],
  providers: [UrlsService],
  exports: [UrlsService],
})
export class UrlsModule {} 