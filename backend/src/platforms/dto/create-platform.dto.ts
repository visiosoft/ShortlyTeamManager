import { IsString, IsOptional, IsBoolean, IsUrl } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePlatformDto {
  @ApiProperty({ description: 'Platform name', example: 'cut.ly' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Platform description', example: 'URL shortening service' })
  @IsString()
  description: string;

  @ApiProperty({ description: 'Platform website URL', example: 'https://cut.ly', required: false })
  @IsOptional()
  @IsUrl()
  website?: string;

  @ApiProperty({ description: 'Platform type', example: 'external', required: false })
  @IsOptional()
  @IsString()
  type?: string;

  @ApiProperty({ description: 'Platform status', example: true, required: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
} 