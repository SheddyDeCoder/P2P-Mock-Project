import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsPositive, IsString, Min } from 'class-validator';

export class CreateSwapDto {
  @ApiProperty({ example: 'USD' })
  @IsString()
  fromAsset: string;

  @ApiProperty({ example: 'BTC' })
  @IsString()
  toAsset: string;

  @ApiProperty({ example: 500 })
  @IsNumber()
  @IsPositive()
  fromAmount: number;

  @ApiProperty({
    example: 'balance_to_wallet',
    enum: ['balance_to_wallet', 'wallet_to_balance'],
    description:
      'balance_to_wallet: spend balance to fill wallet | wallet_to_balance: sell wallet asset back to balance',
  })
  @IsEnum(['balance_to_wallet', 'wallet_to_balance'])
  direction: 'balance_to_wallet' | 'wallet_to_balance';
}
