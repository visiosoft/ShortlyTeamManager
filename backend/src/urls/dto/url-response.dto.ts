import { ApiProperty } from '@nestjs/swagger';

export class UserInfo {
  @ApiProperty()
  id: string;

  @ApiProperty()
  firstName: string;

  @ApiProperty()
  lastName: string;

  @ApiProperty()
  email: string;
}

export class UrlResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  originalUrl: string;

  @ApiProperty()
  shortCode: string;

  @ApiProperty()
  shortUrl: string;

  @ApiProperty()
  clicks: number;

  @ApiProperty()
  isActive: boolean;

  @ApiProperty({ required: false })
  title?: string;

  @ApiProperty({ required: false })
  description?: string;

  @ApiProperty()
  userId: string;

  @ApiProperty({ required: false })
  user?: UserInfo;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
} 