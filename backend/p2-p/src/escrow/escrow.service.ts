import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { TradeStatus } from '@prisma/client';
import { validateTradeTransition } from 'src/commom/utils/trade-status-flow.utils';

@Injectable()
export class EscrowService {
  constructor(private readonly prisma: PrismaService) {}

  async create(tradeId: string) {
    const trade = await this.prisma.trade.findUnique({
      where: { id: tradeId },
    });

    if (!trade) {
      throw new NotFoundException(`Trade with ID ${tradeId} not found`);
    }

    if (trade.status !== TradeStatus.pending) {
      throw new BadRequestException(
        'Trade must be in pending status to create escrow',
      );
    }

    await this.prisma.escrow.create({
      data: {
        tradeId: trade.id,
        contractAddress: '0x1234567890abcdef', // This should be generated or provided
      },
    });
  }

  async updateTradeStatus(tradeId: string, newStatus: TradeStatus) {
    const trade = await this.prisma.trade.findUnique({
      where: { id: tradeId },
    });

    if (!trade) {
      throw new NotFoundException(`Trade with ID ${tradeId} not found`);
    }

    validateTradeTransition(trade.status, newStatus);

    await this.prisma.trade.update({
      where: { id: tradeId },
      data: { status: newStatus },
    });
  }
}
