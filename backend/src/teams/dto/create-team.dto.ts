import { IsString, IsOptional } from 'class-validator';

export class CreateTeamDto {
  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsOptional()
  rewards?: Array<{
    clicks: number;
    amount: number;
    currency: string;
  }>;
} 