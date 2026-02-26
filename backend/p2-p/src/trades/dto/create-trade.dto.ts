import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsPositive, Min } from 'class-validator';
import { IsString } from 'class-validator/types/decorator/typechecker/IsString';

export class CreateTradeDto {
  @ApiProperty({ description: 'The ID of the buyer' })
  @IsString({ message: 'Buyer ID must be a string' })
  buyer_id: string;

  @ApiProperty({ description: 'The ID of the seller' })
  @IsOptional()
  @IsString({ message: 'Seller ID must be a string' })
  seller_id?: string;

  @ApiProperty({ description: 'The amount of the trade' })
  @IsNumber({}, { message: 'Amount must be a number' })
  @IsPositive({ message: 'Amount must be a positive number' })
  @Min(0.01, { message: 'Amount must be at least 0.01' })
  amount: number;

  @ApiProperty({ description: 'The status of the trade' })
  @IsOptional()
  @IsString({ message: 'Status must be a string' })
  status?: string;
}
