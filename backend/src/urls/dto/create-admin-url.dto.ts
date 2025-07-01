import { IsString, IsUrl, IsOptional, IsNotEmpty } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateAdminUrlDto {
  @ApiProperty({ description: 'The original URL to shorten' })
  @IsUrl({}, { message: 'Please provide a valid URL' })
  originalUrl: string;

  @ApiProperty({ description: 'The ID of the user for whom this URL is being created' })
  @IsString()
  @IsNotEmpty()
  targetUserId: string;

  @ApiPropertyOptional({ description: 'Custom short code (optional)' })
  @IsOptional()
  @IsString()
  customShortCode?: string;

  @ApiPropertyOptional({ description: 'Title for the URL' })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional({ description: 'Description for the URL' })
  @IsOptional()
  @IsString()
  description?: string;
} 