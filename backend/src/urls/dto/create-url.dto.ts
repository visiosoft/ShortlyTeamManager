import { IsUrl, IsOptional, IsString, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUrlDto {
  @ApiProperty({
    description: 'The original URL to be shortened',
    example: 'https://www.google.com',
  })
  @IsUrl({}, { message: 'Please provide a valid URL' })
  originalUrl: string;

  @ApiProperty({
    description: 'Custom short code (optional)',
    example: 'google',
    required: false,
  })
  @IsOptional()
  @IsString()
  @Length(3, 10, { message: 'Short code must be between 3 and 10 characters' })
  customShortCode?: string;

  @ApiProperty({
    description: 'Title for the URL (optional)',
    example: 'Google Homepage',
    required: false,
  })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiProperty({
    description: 'Description for the URL (optional)',
    example: 'Search engine homepage',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;
} 