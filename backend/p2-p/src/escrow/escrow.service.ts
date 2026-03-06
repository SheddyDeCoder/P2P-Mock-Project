import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { EscrowStatus, TradeStatus } from '@prisma/client';
import { UpdateEscrowDto } from './dto/update-escrow.dto';

@Injectable()
export class EscrowService {
  constructor(private readonly prisma: PrismaService) {}

  async findOne(id: string) {
    const escrow = await this.prisma.escrow.findUnique({
      where: { id },
      include: {
        trade: {
          include: {
            buyer: true,
            seller: true,
            offer: true,
          },
        },
      },
    });

    if (!escrow) {
      throw new NotFoundException(`Escrow with ID ${id} not found`);
    }

    return escrow;
  }

  async findByTrade(tradeId: string) {
    const escrow = await this.prisma.escrow.findUnique({
      where: { tradeId },
      include: {
        trade: {
          include: {
            buyer: true,
            seller: true,
            offer: true,
          },
        },
      },
    });
    if (!escrow) {
      throw new NotFoundException(`Escrow for Trade ID ${tradeId} not found`);
    }
    return escrow;
  }

  async updateStatus(id: string, updateEscrowDto: UpdateEscrowDto) {
    const { status, contractAddress } = updateEscrowDto;

    const escrow = await this.prisma.escrow.findUnique({
      where: { id },
      include: {
        trade: true,
      },
    });

    if (!escrow) {
      throw new NotFoundException(`Escrow with ID ${id} not found`);
    }

    // Enforce valid status transitions
    const allowedTransitions: Record<EscrowStatus, EscrowStatus[]> = {
      locked: [EscrowStatus.released, EscrowStatus.disputed],
      released: [], // terminal state
      disputed: [], // terminal state
    };

    const allowed = allowedTransitions[escrow.status];

    if (!allowed.includes(status)) {
      throw new BadRequestException(
        `Invalid status transition from ${escrow.status} to ${status}`,
      );
    }

    if (status === EscrowStatus.released) {
      const { buyerId, sellerId, amount } = escrow.trade;

      const [updatedEscrow] = await this.prisma.$transaction([
        // 1. Update escrow → released
        this.prisma.escrow.update({
          where: { id },
          data: {
            status: EscrowStatus.released,
            ...(contractAddress && { contractAddress }),
          },
        }),

        // 2. Update trade → completed
        this.prisma.trade.update({
          where: { id: escrow.tradeId },
          data: { status: TradeStatus.completed },
        }),

        // 3. Deduct from seller
        this.prisma.user.update({
          where: { id: sellerId },
          data: { balance: { decrement: amount } },
        }),

        // 4. Add to buyer
        this.prisma.user.update({
          where: { id: buyerId },
          data: { balance: { increment: amount } },
        }),
      ]);

      return {
        message: 'Escrow released — trade completed and balances updated',
        escrow: updatedEscrow,
      };
    }

    const updatedEscrow = await this.prisma.escrow.update({
      where: { id },
      data: {
        status,
        ...(contractAddress && { contractAddress }),
      },
    });

    return {
      message: `Escrow status updated to "${updatedEscrow.status}"`,
      escrow: updatedEscrow,
    };
  }
}
