import { IsArray, IsNumber, IsString, IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class RewardTierDto {
  @IsNumber()
  clicks: number;

  @IsNumber()
  amount: number;

  @IsString()
  currency: string;
}

export class UpdateRewardsDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RewardTierDto)
  rewards: RewardTierDto[];
} 