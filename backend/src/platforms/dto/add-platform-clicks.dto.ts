import { IsString, IsNumber, IsDateString, IsOptional, IsMongoId, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Types } from 'mongoose';

export class AddPlatformClicksDto {
  @ApiProperty({ description: 'Platform ID', example: '507f1f77bcf86cd799439011' })
  @IsMongoId()
  platformId: string;

  @ApiProperty({ description: 'User ID', example: '507f1f77bcf86cd799439012' })
  @IsMongoId()
  userId: string;

  @ApiProperty({ description: 'Number of clicks', example: 150 })
  @IsNumber()
  @Min(1)
  clicks: number;

  @ApiProperty({ description: 'Date for the clicks', example: '2024-01-15' })
  @IsDateString()
  date: string;

  @ApiProperty({ description: 'Rate per click in PKR', example: 0.5, required: false })
  @IsOptional()
  @IsNumber()
  ratePerClick?: number;

  @ApiProperty({ description: 'Additional notes', example: 'From cut.ly dashboard', required: false })
  @IsOptional()
  @IsString()
  notes?: string;
} 