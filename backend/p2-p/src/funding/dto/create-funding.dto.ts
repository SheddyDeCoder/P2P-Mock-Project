import { ApiProperty } from '@nestjs/swagger';
import { FundingType } from '@prisma/client';
import { IsEnum, IsNumber, IsPositive, IsString } from 'class-validator';
import { Min } from 'class-validator';

export class CreateFundingDto {
  @ApiProperty({ enum: FundingType, description: 'deposit or withdrawal' })
  @IsEnum(FundingType)
  type: FundingType;

  @ApiProperty({ example: 'USD', description: 'Asset e.g. USD, BTC, NGN' })
  @IsString()
  asset: string;

  @ApiProperty({ example: 1000 })
  @IsNumber()
  @IsPositive()
  @Min(0.01)
  amount: number;
}
