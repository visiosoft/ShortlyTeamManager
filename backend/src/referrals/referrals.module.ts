import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ReferralsService } from './referrals.service';
import { ReferralsController } from './referrals.controller';
import { User, UserSchema } from '../users/schemas/user.schema';
import { Team, TeamSchema } from '../teams/schemas/team.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Team.name, schema: TeamSchema }
    ]),
  ],
  controllers: [ReferralsController],
  providers: [ReferralsService],
  exports: [ReferralsService],
})
export class ReferralsModule {} 