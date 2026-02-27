import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class CreateEscrowDto {
  @ApiProperty({
    description: 'The ID of the trade to fund',
    example: 'b7f7c2b4-6d3a-4c5f-9a12-8c8f8b123456',
  })
  @IsUUID()
  tradeId: string;
}
