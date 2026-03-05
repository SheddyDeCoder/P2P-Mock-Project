import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateSwapDto } from './dto/create-swap.dto';
import { UpdateSwapDto } from './dto/update-swap.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { ExchangeRateService } from 'src/exchange-rate/exchange-rate.service';
import { v4 as uuidv4 } from 'uuid';
import { SwapStatus } from '@prisma/client';

@Injectable()
export class SwapService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly exchangeRate: ExchangeRateService,
  ) {}

  async create(userId: string, createSwapDto: CreateSwapDto) {
    const { fromAsset, toAsset, fromAmount } = createSwapDto;

    if (fromAsset === toAsset) {
      throw new BadRequestException('Cannot Swap a coin to itself');
    }

    const user = await this.prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    if (Number(user.balance) < fromAmount) {
      throw new BadRequestException('Insufficient balance');
    }

    const rate = await this.exchangeRate.getRate(fromAsset, toAsset);
    const toAmount = fromAmount * rate;
    const reference = uuidv4();

    const result = await this.prisma.$transaction(async (tx) => {
      const swap = await tx.swap.create({
        data: {
          userId,
          fromAsset,
          toAsset,
          fromAmount,
          toAmount,
          rate,
          reference,
          status: SwapStatus.completed,
        },
      });

      await tx.user.update({
        where: { id: userId },
        data: { balance: { decrement: fromAmount } },
      });

      await tx.user.update({
        where: { id: userId },
        data: { balance: { increment: toAmount } },
      });
      return swap;
    });
    return {
      message: `Swapped ${fromAmount} ${fromAsset} → ${result.toAmount} ${toAsset}`,
      rate,
      swap: result,
    };
  }

  async findByUser(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    return this.prisma.swap.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }
}
