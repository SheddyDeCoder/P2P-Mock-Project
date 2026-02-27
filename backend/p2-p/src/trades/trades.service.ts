import { Injectable } from '@nestjs/common';
import { CreateTradeDto } from './dto/create-trade.dto';
import { UpdateTradeDto } from './dto/update-trade.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class TradesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createTradeDto: CreateTradeDto) {
    const { buyerId, sellerId, offerId, amount, status } = createTradeDto;

    if (buyerId === sellerId) {
      return { message: 'Buyer and seller cannot be the same' };
    }

    const buyer = await this.prisma.user.findUnique({ where: { id: buyerId } });
    if (!buyer) {
      return { message: `Buyer with the given ID ${buyerId} does not exist` };
    }
    const seller = await this.prisma.user.findUnique({
      where: { id: sellerId },
    });
    if (!seller) {
      return { message: `Seller with the given ID ${sellerId} does not exist` };
    }

    const trade = await this.prisma.trade.create({
      data: {
        buyerId,
        sellerId,
        offerId,
        amount,
        status,
      },
    });
    return { message: 'Trade created successfully', trade };
  }

  async findAll() {
    return this.prisma.trade.findMany({
      select: {
        id: true,
        amount: true,
        status: true,
        createdAt: true,
        buyer: true,
        seller: true,
        offer: true,
      },
    });
  }
}
