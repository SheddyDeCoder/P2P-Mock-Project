import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateSwapDto } from './dto/create-swap.dto';
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
    const { fromAsset, toAsset, fromAmount, direction } = createSwapDto;

    if (fromAsset === toAsset) {
      throw new BadRequestException('Cannot swap a coin to itself');
    }

    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    let rate: number;
    try {
      rate = await this.exchangeRate.getRate(fromAsset, toAsset);
    } catch {
      throw new BadRequestException(
        `Could not fetch exchange rate for ${fromAsset} → ${toAsset}. Try again later.`,
      );
    }

    const toAmount = fromAmount * rate;
    const reference = uuidv4();

    if (direction === 'balance_to_wallet') {
      // Check sender's fromAsset wallet balance
      const fromWallet = await this.prisma.wallet.findUnique({
        where: { userId_asset: { userId, asset: fromAsset } },
      });

      if (!fromWallet || Number(fromWallet.balance) < fromAmount) {
        throw new BadRequestException(
          `Insufficient ${fromAsset} wallet balance — have ${fromWallet?.balance ?? 0}, need ${fromAmount}`,
        );
      }

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

        // Deduct from fromAsset wallet
        await tx.wallet.update({
          where: { userId_asset: { userId, asset: fromAsset } },
          data: { balance: { decrement: fromAmount } },
        });

        // Credit toAsset wallet (create if it doesn't exist)
        await tx.wallet.upsert({
          where: { userId_asset: { userId, asset: toAsset } },
          create: {
            userId,
            walletAddress: user.walletAddress ?? '',
            asset: toAsset,
            balance: toAmount,
          },
          update: {
            balance: { increment: toAmount },
          },
        });

        return swap;
      });

      return {
        message: `Swapped ${fromAmount} ${fromAsset} → ${result.toAmount} ${toAsset}`,
        rate,
        swap: result,
      };
    } else if (direction === 'wallet_to_balance') {
      // Check sender's fromAsset wallet balance
      const fromWallet = await this.prisma.wallet.findUnique({
        where: { userId_asset: { userId, asset: fromAsset } },
      });

      if (!fromWallet || Number(fromWallet.balance) < fromAmount) {
        throw new BadRequestException(
          `Insufficient ${fromAsset} wallet balance — have ${fromWallet?.balance ?? 0}, need ${fromAmount}`,
        );
      }

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

        // Deduct from fromAsset wallet
        await tx.wallet.update({
          where: { userId_asset: { userId, asset: fromAsset } },
          data: { balance: { decrement: fromAmount } },
        });

        // Credit toAsset wallet (create if it doesn't exist)
        await tx.wallet.upsert({
          where: { userId_asset: { userId, asset: toAsset } },
          create: {
            userId,
            walletAddress: user.walletAddress ?? '',
            asset: toAsset,
            balance: toAmount,
          },
          update: {
            balance: { increment: toAmount },
          },
        });

        return swap;
      });

      return {
        message: `Swapped ${fromAmount} ${fromAsset} → ${result.toAmount} ${toAsset}`,
        rate,
        swap: result,
      };
    } else {
      throw new BadRequestException(
        'Invalid direction — must be balance_to_wallet or wallet_to_balance',
      );
    }
  }

  async findByUser(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException(`User with ID ${userId} not found`);

    return this.prisma.swap.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }
}
