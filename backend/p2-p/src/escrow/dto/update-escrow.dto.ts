import { ApiProperty, PartialType } from '@nestjs/swagger';
import { EscrowStatus, TradeStatus } from '@prisma/client/edge';
import { IsEnum, IsOptional, IsString } from 'class-validator';

export class UpdateEscrowDto {
  @ApiProperty({
    description: 'New status of the escrow',
    enum: EscrowStatus,
    example: EscrowStatus.locked,
  })
  @IsEnum(EscrowStatus)
  status: EscrowStatus;

  @ApiProperty({
    description: 'Optional contract address for the escrow',
    example: '0x1234567890abcdef1234567890abcdef12345678',
  })
  @IsOptional()
  @IsString()
  contractAddress?: string;
}
