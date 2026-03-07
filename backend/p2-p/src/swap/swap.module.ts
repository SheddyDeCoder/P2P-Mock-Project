import { Module } from '@nestjs/common';
import { SwapService } from './swap.service';
import { SwapController } from './swap.controller';
import { ExchangeRateService } from 'src/exchange-rate/exchange-rate.service';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  controllers: [SwapController],
  providers: [SwapService, ExchangeRateService, PrismaService],
})
export class SwapModule {}
