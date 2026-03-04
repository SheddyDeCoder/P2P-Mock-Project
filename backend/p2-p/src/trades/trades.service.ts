import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { CreateTradeDto } from './dto/create-trade.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { EscrowStatus, TradeStatus } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class TradesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createTradeDto: CreateTradeDto) {
    const { buyerId, sellerId, offerId, amount } = createTradeDto;

    const idempotencyKey = uuidv4();

    const existingTrade = await this.prisma.trade.findUnique({
      where: { idempotencyKey },
      include: { escrow: true },
    });
    if (existingTrade) {
      return {
        message: 'A trade with the same idempotency key already exists',
        trade: existingTrade,
        escrow: existingTrade.escrow,
      };
    }

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

    const offer = await this.prisma.offer.findUnique({
      where: { id: offerId },
    });
    if (!offer) {
      return { message: `Offer with the given ID ${offerId} does not exist` };
    }

    if (offer.status === 'closed') {
      return { message: 'This Offer is closed' };
    }

    const results = await this.prisma.$transaction(async (tx) => {
      const trade = await tx.trade.create({
        data: {
          buyerId,
          sellerId,
          offerId,
          amount,
          idempotencyKey,
          status: TradeStatus.pending,
        },
      });

      const escrow = await tx.escrow.create({
        data: {
          tradeId: trade.id,
          status: EscrowStatus.locked,
        },
      });

      return { trade, escrow };
    });

    return {
      message: 'Trade created successfully',
      trade: results.trade,
      escrow: results.escrow,
    };
  }

  async updateTradeStatus(id: string, status: TradeStatus) {
    const trade = await this.prisma.trade.findUnique({
      where: { id },
      include: { escrow: true },
    });

    if (!trade) {
      throw new NotFoundException(
        `Trade with the given ID ${id} does not exist`,
      );
    }

    // Enforce valid status transitions
    const allowedTransitions: Record<TradeStatus, TradeStatus[]> = {
      [TradeStatus.pending]: [TradeStatus.funded, TradeStatus.cancelled],
      [TradeStatus.funded]: [TradeStatus.completed, TradeStatus.cancelled],
      [TradeStatus.completed]: [], // terminal
      [TradeStatus.cancelled]: [], // terminal
    };

    if (!allowedTransitions[trade.status].includes(status)) {
      throw new BadRequestException(
        `Cannot transition trade from "${trade.status}" to "${status}"`,
      );
    }

    const result = await this.prisma.$transaction(async (tx) => {
      const updatedTrade = await tx.trade.update({
        where: { id },
        data: { status },
      });

      if (status === TradeStatus.completed) {
        await tx.user.update({
          where: { id: trade.buyerId },
          data: { balance: { decrement: trade.amount } },
        });

        await tx.user.update({
          where: { id: trade.sellerId },
          data: { balance: { increment: trade.amount } },
        });

        await tx.escrow.update({
          where: { tradeId: id },
          data: { status: EscrowStatus.released },
        });
      }

      if (status === TradeStatus.cancelled) {
        await tx.escrow.update({
          where: { tradeId: id },
          data: { status: EscrowStatus.released },
        });
      }

      return updatedTrade;
    });

    return {
      message: `Trade status updated to "${result.status}"`,
      trade: result,
    };
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
        escrow: true,
      },
    });
  }
}
