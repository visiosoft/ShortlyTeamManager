import { IsString, IsOptional, IsNumber, IsEnum } from 'class-validator';

export class ProcessPayoutDto {
  @IsString()
  userId: string;

  @IsString()
  period: string; // e.g., "2024-01"

  @IsNumber()
  amount: number;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsString()
  @IsOptional()
  transactionId?: string;
} 