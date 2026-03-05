import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsPositive, IsString, Min } from 'class-validator';

export class CreateSwapDto {
  @ApiProperty({ example: 'BTC', description: 'Asset to swap from' })
  @IsString()
  fromAsset: string;

  @ApiProperty({ example: 'USD', description: 'Asset to swap to' })
  @IsString()
  toAsset: string;

  @ApiProperty({ example: 0.5, description: 'Amount to swap' })
  @IsNumber()
  @IsPositive()
  @Min(0.00001)
  fromAmount: number;
}
