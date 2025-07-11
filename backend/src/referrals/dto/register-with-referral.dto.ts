import { IsEmail, IsString, IsOptional, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterWithReferralDto {
  @ApiProperty({ description: 'User email address' })
  @IsEmail()
  email: string;

  @ApiProperty({ description: 'User password' })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({ description: 'User first name' })
  @IsString()
  firstName: string;

  @ApiProperty({ description: 'User last name' })
  @IsString()
  lastName: string;

  @ApiProperty({ description: 'Referral code (required for this registration method)' })
  @IsString()
  referralCode: string;
} 