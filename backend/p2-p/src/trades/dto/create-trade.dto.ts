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
  @ApiProperty({ description: 'The ID of the offer' })
  @IsString()
  counterpartyId: string;

  @ApiProperty({ description: 'The amount of the trade' })
  @IsNumber({}, { message: 'Amount must be a number' })
  @IsPositive({ message: 'Amount must be a positive number' })
  @Min(0.01, { message: 'Amount must be at least 0.01' })
  amount: number;
}
