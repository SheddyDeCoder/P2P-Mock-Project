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

  async create(currentUserId: string, createTradeDto: CreateTradeDto) {
    const { counterpartyId, amount } = createTradeDto;

    if (currentUserId === counterpartyId) {
      throw new BadRequestException('You cannot trade with yourself');
    }

    // Verify counterparty exists
    const counterparty = await this.prisma.user.findUnique({
      where: { id: counterpartyId },
    });

    if (!counterparty) {
      throw new NotFoundException(
        `User with ID ${counterpartyId} does not exist`,
      );
    }

    const offer = await this.prisma.offer.findFirst({
      where: {
        userId: currentUserId, // must be the current user's offer
        status: 'active', // must be active
      },
      orderBy: { createdAt: 'desc' }, // most recent offer first
    });

    if (!offer) {
      throw new NotFoundException(
        'You have no active offer. Please create an offer first before initiating a trade',
      );
    }

    const buyerId = offer.type === 'buy' ? currentUserId : counterpartyId;
    const sellerId = offer.type === 'sell' ? currentUserId : counterpartyId;

    const buyer = await this.prisma.user.findUnique({ where: { id: buyerId } });

    if (!buyer) {
      throw new NotFoundException(`Buyer with ID ${buyerId} does not exist`);
    }

    if (Number(buyer.balance) < amount) {
      throw new BadRequestException(
        `Insufficient funds — buyer balance is ${buyer.balance}, required ${amount}`,
      );
    }

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

    const results = await this.prisma.$transaction(async (tx) => {
      const trade = await tx.trade.create({
        data: {
          buyerId,
          sellerId,
          offerId: offer.id, // auto-determined from current user's active offer
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

  async findAllMyTrade(userId: string) {
    return this.prisma.trade.findMany({
      where: {
        OR: [
          { buyerId: userId }, // trades where I am the buyer
          { sellerId: userId }, // trades where I am the seller
        ],
      },
      include: {
        offer: true,
        escrow: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}
