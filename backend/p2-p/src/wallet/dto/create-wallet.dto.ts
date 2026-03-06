import { ApiProperty } from '@nestjs/swagger';
import { FundingType } from '@prisma/client';
import { IsEnum, IsNumber, IsPositive, IsString, Min } from 'class-validator';

export class CreateWalletDto {
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

  @ApiProperty({
    example: '0xax28Hn92pmH2k4wYVu2kfsi6MBSn5tvNOHwQaTO0',
    description: 'Wallet address to fund',
  })
  @IsString()
  walletAddress: string;
}
