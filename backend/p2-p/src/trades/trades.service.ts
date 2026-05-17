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

  async create(currentUserId: string | null, createTradeDto: CreateTradeDto) {
    const { offerId, counterpartyId, amount, walletAddress } = createTradeDto;

    // Find the specific offer by ID
    const offer = await this.prisma.offer.findFirst({
      where: { id: offerId, status: 'active' },
    });

    if (!offer) {
      throw new NotFoundException('Offer not found or no longer active');
    }

    // Prevent trading against your own offer
    if (currentUserId && currentUserId === offer.userId) {
      throw new BadRequestException('You cannot trade against your own offer');
    }

    // Determine buyer and seller based on offer type
    const buyerId =
      offer.type === 'buy'
        ? (offer.userId ?? undefined)
        : (currentUserId ?? undefined);

    const sellerId =
      offer.type === 'sell'
        ? (offer.userId ?? undefined)
        : (currentUserId ?? undefined);

    const idempotencyKey = uuidv4();

    const results = await this.prisma.$transaction(async (tx) => {
      const trade = await tx.trade.create({
        data: {
          buyerId: buyerId ?? undefined,
          sellerId: sellerId ?? undefined,
          offerId: offer.id,
          amount,
          idempotencyKey,
          status: TradeStatus.pending,
        },
      });

      const escrow = await tx.escrow.create({
        data: {
          tradeId: trade.id,
          status: EscrowStatus.locked,
          contractAddress: walletAddress ?? null,
        },
      });

      return { trade, escrow };
    });

    return {
      message: 'Trade created successfully',
      trade: results.trade,
      escrow: results.escrow,
      matchedOffer: {
        id: offer.id,
        type: offer.type,
        asset: offer.asset,
      },
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

    const allowedTransitions: Record<TradeStatus, TradeStatus[]> = {
      [TradeStatus.pending]: [TradeStatus.funded, TradeStatus.cancelled],
      [TradeStatus.funded]: [TradeStatus.completed, TradeStatus.cancelled],
      [TradeStatus.completed]: [],
      [TradeStatus.cancelled]: [],
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
        if (trade.buyerId) {
          await tx.user.update({
            where: { id: trade.buyerId },
            data: { balance: { decrement: trade.amount } },
          });
        }

        if (trade.sellerId) {
          await tx.user.update({
            where: { id: trade.sellerId },
            data: { balance: { increment: trade.amount } },
          });
        }

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

  async findAllMyTrade(userId: string | null) {
    if (!userId) return [];

    return this.prisma.trade.findMany({
      where: {
        OR: [{ buyerId: userId }, { sellerId: userId }],
      },
      include: {
        offer: true,
        escrow: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}