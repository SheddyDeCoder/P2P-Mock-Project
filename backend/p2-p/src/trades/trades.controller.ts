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
import { UpdateTradeDto } from './dto/update-trade.dto';

@Controller('trades')
export class TradesController {
  constructor(private readonly tradesService: TradesService) {}

  @Post('Create Trade')
  create(@Body(ValidationPipe) createTradeDto: CreateTradeDto) {
    return this.tradesService.create(createTradeDto);
  }

  @Get('Get All Trades')
  findAll() {
    return this.tradesService.findAll();
  }
}
