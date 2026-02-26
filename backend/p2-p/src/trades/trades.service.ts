import { Injectable } from '@nestjs/common';
import { CreateTradeDto } from './dto/create-trade.dto';
import { UpdateTradeDto } from './dto/update-trade.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class TradesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createTradeDto: CreateTradeDto) {
    const { buyer_id, seller_id, amount, status } = createTradeDto;

    const trade = this.prisma.trade.create({
      data: {
        buyer_id,
        seller_id,
        amount,
        status,
      },
    });
    return { message: 'Trade created successfully', trade };
  }

  async findAll() {
    return this.prisma.trade.findMany();
  }
}
