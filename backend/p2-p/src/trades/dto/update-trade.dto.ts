import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateTradeDto } from './create-trade.dto';
import { TradeStatus } from '@prisma/client/edge';
import { IsEnum } from 'class-validator';

export class UpdateTradeStatusDto {
  @ApiProperty({
    example: 'funded',
    description: 'The new status of the trade',
  })
  @IsEnum(TradeStatus)
  status: TradeStatus;
}
