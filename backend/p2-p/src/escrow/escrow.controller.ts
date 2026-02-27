import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { EscrowService } from './escrow.service';
import { CreateEscrowDto } from './dto/create-escrow.dto';
import { UpdateEscrowDto } from './dto/update-escrow.dto';
import { TradeStatus } from '@prisma/client/index-browser';
import { ApiOperation } from '@nestjs/swagger/dist/decorators/api-operation.decorator';
import { ApiParam } from '@nestjs/swagger';

@Controller('escrow')
export class EscrowController {
  constructor(private readonly escrowService: EscrowService) {}

  @Post()
  @ApiOperation({ summary: 'Create escrow and fund trade' })
  async createEscrow(@Body() dto: CreateEscrowDto) {
    return this.escrowService.create(dto.tradeId);
  }

  // PATCH /trade/:id/status
  @Patch('trade/:id/status')
  @ApiOperation({
    summary: 'Update trade status (pending → funded → completed)',
  })
  @ApiParam({
    name: 'id',
    description: 'Trade ID',
    example: 'b7f7c2b4-6d3a-4c5f-9a12-8c8f8b123456',
  })
  async updateTradeStatus(
    @Param('id') id: string,
    @Body() dto: UpdateEscrowDto,
  ) {
    return this.escrowService.updateTradeStatus(id, dto.status);
  }
}
