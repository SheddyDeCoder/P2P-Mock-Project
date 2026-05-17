import { ApiProperty } from '@nestjs/swagger';
import {
  IsNumber,
  IsPositive,
  IsString,
  IsOptional,
  Min,
} from 'class-validator';

export class CreateTradeDto {
  @ApiProperty({ description: 'The ID of the offer to trade against' })
  @IsString()
  offerId: string;

  @ApiProperty({ description: 'The ID of the counterparty user' })
  @IsString()
  counterpartyId: string;

  @ApiProperty({ description: 'The amount of the trade' })
  @IsNumber({}, { message: 'Amount must be a number' })
  @IsPositive({ message: 'Amount must be a positive number' })
  @Min(0.01, { message: 'Amount must be at least 0.01' })
  amount: number;

  @ApiProperty({ description: 'Guest wallet address for escrow (optional)' })
  @IsString()
  @IsOptional()
  walletAddress?: string;
}