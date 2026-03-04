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
import { UpdateEscrowDto } from './dto/update-escrow.dto';
import { TradeStatus } from '@prisma/client/index-browser';
import { ApiOperation } from '@nestjs/swagger/dist/decorators/api-operation.decorator';
import { ApiParam } from '@nestjs/swagger';

@Controller('escrow')
export class EscrowController {
  constructor(private readonly escrowService: EscrowService) {}

  // GET /escrow/trade/:tradeId  <-- must come BEFORE /escrow/:id
  // otherwise NestJS will treat "trade" as an :id param
  @Get('trade/:tradeId')
  findByTrade(@Param('tradeId') tradeId: string) {
    return this.escrowService.findByTrade(tradeId);
  }

  // GET /escrow/:id
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.escrowService.findOne(id);
  }

  // PATCH /escrow/:id
  @Patch(':id')
  updateStatus(
    @Param('id') id: string,
    @Body() updateEscrowDto: UpdateEscrowDto,
  ) {
    return this.escrowService.updateStatus(id, updateEscrowDto);
  }
}
