import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ValidationPipe,
} from '@nestjs/common';
import { TradesService } from './trades.service';
import { CreateTradeDto } from './dto/create-trade.dto';
import { TradeStatus } from '@prisma/client/index-browser';
import { ApiProperty } from '@nestjs/swagger';
import { UpdateTradeStatusDto } from './dto/update-trade.dto';

@Controller('trades')
export class TradesController {
  constructor(private readonly tradesService: TradesService) {}

  @Post()
  create(@Body(ValidationPipe) createTradeDto: CreateTradeDto) {
    return this.tradesService.create(createTradeDto);
  }

  @Patch(':id/status')
  @ApiProperty({
    example: '1',
    description: 'The ID of the trade to update the status for',
  })
  updateStatus(
    @Param('id') id: string,
    @Body(ValidationPipe) updateTradeStatusDto: UpdateTradeStatusDto,
  ) {
    return this.tradesService.updateTradeStatus(
      id,
      updateTradeStatusDto.status,
    );
  }

  @Get()
  findAll() {
    return this.tradesService.findAll();
  }
}
