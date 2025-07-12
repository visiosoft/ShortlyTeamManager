import { IsString, IsUrl, IsOptional, IsArray } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateDefaultUrlDto {
  @ApiProperty({
    description: 'The original URL to be shortened',
    example: 'https://example.com',
  })
  @IsUrl()
  originalUrl: string;

  @ApiProperty({
    description: 'Custom short code (optional)',
    example: 'custom123',
    required: false,
  })
  @IsOptional()
  @IsString()
  customShortCode?: string;

  @ApiProperty({
    description: 'Title for the URL',
    example: 'My Website',
    required: false,
  })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiProperty({
    description: 'Description for the URL',
    example: 'This is my personal website',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'Array of user IDs to assign this URL to (optional)',
    example: ['507f1f77bcf86cd799439011'],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  assignToUserIds?: string[];
} 