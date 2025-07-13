import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PlatformsService } from './platforms.service';
import { PlatformsController } from './platforms.controller';
import { Platform, PlatformSchema } from './schemas/platform.schema';
import { PlatformClick, PlatformClickSchema } from './schemas/platform-click.schema';
import { User, UserSchema } from '../users/schemas/user.schema';
import { Team, TeamSchema } from '../teams/schemas/team.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Platform.name, schema: PlatformSchema },
      { name: PlatformClick.name, schema: PlatformClickSchema },
      { name: User.name, schema: UserSchema },
      { name: Team.name, schema: TeamSchema },
    ]),
  ],
  controllers: [PlatformsController],
  providers: [PlatformsService],
  exports: [PlatformsService],
})
export class PlatformsModule {} 