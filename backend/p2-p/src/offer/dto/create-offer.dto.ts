import { ApiProperty } from '@nestjs/swagger';
import { OfferType } from '@prisma/client/edge';
import {
  IsEnum,
  IsNumber,
  IsPositive,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';
export class CreateOfferDto {
  @ApiProperty({ description: 'The ID of the user creating the offer' })
  @IsUUID('4', { message: 'User ID must be a valid UUID' })
  userId: string;

  @ApiProperty({ description: 'The type of offer: buy or sell' })
  @IsEnum(OfferType, { message: 'Type must be either buy or sell' })
  type: OfferType;

  @ApiProperty({ description: 'The asset being traded e.g. BTC, ETH' })
  @IsString({ message: 'Asset must be a string' })
  asset: string;

  @ApiProperty({ description: 'The price of the asset' })
  @IsNumber({}, { message: 'Price must be a number' })
  @IsPositive({ message: 'Price must be a positive number' })
  @Min(0.01, { message: 'Price must be at least 0.01' })
  price: number;
}
