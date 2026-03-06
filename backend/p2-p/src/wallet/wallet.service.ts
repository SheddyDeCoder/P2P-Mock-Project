import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateWalletDto } from './dto/create-wallet.dto';
import { UpdateWalletDto } from './dto/update-wallet.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { randomUUID } from 'crypto';

@Injectable()
export class WalletService {
  constructor(private readonly prisma: PrismaService) {}

  async create(senderId: string, dto: CreateWalletDto) {
    const { type, asset, amount, walletAddress } = dto;

    const sender = await this.prisma.user.findUnique({
      where: { id: senderId },
    });
    if (!sender) throw new NotFoundException('Sender not found');

    const recipient = await this.prisma.user.findUnique({
      where: { walletAddress },
    });
    if (!recipient) {
      throw new NotFoundException(
        `No user found with wallet address ${walletAddress}`,
      );
    }

    if (sender.id === recipient.id) {
      throw new BadRequestException('You cannot fund your own wallet');
    }

    // IDEMPOTENCY CHECK
    const existing = await this.prisma.funding.findFirst({
      where: { userId: recipient.id, type, asset, amount, status: 'pending' },
    });
    if (existing) return existing;

    /**
     * ASSET BALANCE CHECK
     * --------------------
     * Check sender's ASSET wallet balance — not overall user.balance.
     * e.g. sender must have enough BTC in their BTC wallet to send BTC.
     */
    const senderWallet = await this.prisma.wallet.findUnique({
      where: { userId_asset: { userId: senderId, asset } },
    });

    if (!senderWallet || Number(senderWallet.balance) < amount) {
      throw new BadRequestException(
        `Insufficient ${asset} balance — your ${asset} wallet balance is ${senderWallet?.balance ?? 0}, required ${amount}`,
      );
    }

    const [funding] = await this.prisma.$transaction([
      // 1. Create funding record
      this.prisma.funding.create({
        data: {
          userId: recipient.id,
          type,
          asset,
          amount,
          status: 'completed',
          reference: randomUUID(),
        },
      }),

      // 2. Deduct from sender's asset wallet
      this.prisma.wallet.update({
        where: { userId_asset: { userId: senderId, asset } },
        data: { balance: { decrement: amount } },
      }),

      // 3. Upsert recipient's asset wallet
      this.prisma.wallet.upsert({
        where: { userId_asset: { userId: recipient.id, asset } },
        create: {
          userId: recipient.id,
          walletAddress,
          asset,
          balance: amount,
        },
        update: {
          balance: { increment: amount },
        },
      }),
    ]);

    return {
      message: `Successfully funded ${walletAddress} with ${amount} ${asset}`,
      funding,
    };
  }

  async getWallets(userId: string) {
    /**
     * Returns all asset wallets for the user.
     * Each entry shows the asset and its balance.
     * e.g. [{ asset: 'BTC', balance: 0.5 }, { asset: 'USD', balance: 1000 }]
     */
    return this.prisma.wallet.findMany({
      where: { userId },
      select: {
        asset: true,
        balance: true,
        walletAddress: true,
        updatedAt: true,
      },
      orderBy: { asset: 'asc' },
    });
  }
}
