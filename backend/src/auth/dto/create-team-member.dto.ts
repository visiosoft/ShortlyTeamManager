import { IsEmail, IsString, MinLength, IsOptional, IsIn } from 'class-validator';

export class CreateTeamMemberDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsOptional()
  @IsIn(['admin', 'user'])
  role?: 'admin' | 'user';
} 