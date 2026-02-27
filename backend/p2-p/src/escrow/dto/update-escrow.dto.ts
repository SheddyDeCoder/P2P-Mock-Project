import { ApiProperty, PartialType } from '@nestjs/swagger';
import { TradeStatus } from '@prisma/client/edge';
import { IsEnum } from 'class-validator';

export class UpdateEscrowDto {
  @ApiProperty({
    description: 'New status of the trade',
    enum: TradeStatus,
    example: TradeStatus.funded,
  })
  @IsEnum(TradeStatus)
  status: TradeStatus;
}
