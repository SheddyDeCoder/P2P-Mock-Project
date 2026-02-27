import { ApiProperty } from '@nestjs/swagger';
import { TradeStatus } from '@prisma/client/wasm';
import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsPositive,
  IsUUID,
  Min,
  IsString,
} from 'class-validator';

export class CreateTradeDto {
  @ApiProperty({ description: 'The ID of the buyer' })
  @IsString({ message: 'Buyer ID must be a string' })
  buyerId: string;

  @ApiProperty({ description: 'The ID of the seller' })
  @IsOptional()
  @IsString({ message: 'Seller ID must be a string' })
  sellerId: string;

  @ApiProperty({ description: 'The ID of the offer' })
  @IsUUID('4', { message: 'Offer ID must be a valid UUID' })
  offerId: string;

  @ApiProperty({ description: 'The amount of the trade' })
  @IsNumber({}, { message: 'Amount must be a number' })
  @IsPositive({ message: 'Amount must be a positive number' })
  @Min(0.01, { message: 'Amount must be at least 0.01' })
  amount: number;

  @ApiProperty({ description: 'The status of the trade' })
  @IsOptional()
  @IsEnum(TradeStatus, {
    message: 'Status must be a valid trade status: pending, funded, completed',
  })
  status: TradeStatus = TradeStatus.pending;
}
