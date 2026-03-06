import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { randomUUID } from 'crypto';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateFundingDto } from './dto/create-funding.dto';

@Injectable()
export class FundingService {
  constructor(private readonly prisma: PrismaService) {}

  // async create(userId: string, dto: CreateFundingDto) {
  //   const { type, asset, amount } = dto;

  //   const existing = await this.prisma.funding.findFirst({
  //     where: {
  //       userId,
  //       type,
  //       asset,
  //       amount,
  //       status: 'pending', // only block duplicates that haven't been processed yet
  //     },
  //   });

  //   if (existing) {
  //     // Return the existing record instead of creating a duplicate
  //     return existing;
  //   }

  //   return this.prisma.funding.create({
  //     data: {
  //       userId,
  //       type,
  //       asset,
  //       amount,
  //       reference: randomUUID(), // unique transaction reference per new entry
  //     },
  //     include: {
  //       user: true,
  //     },
  //   });
  // }

  async create(userId: string, dto: CreateFundingDto) {
    const { type, asset, amount } = dto;

    // IDEMPOTENCY CHECK — return existing pending record if duplicate
    const existing = await this.prisma.funding.findFirst({
      where: { userId, type, asset, amount, status: 'pending' },
    });

    if (existing) {
      return existing;
    }

    // BALANCE CHECK — only for withdrawals
    if (type === 'withdrawal') {
      const user = await this.prisma.user.findUnique({ where: { id: userId } });

      if (!user) throw new NotFoundException('User not found');

      if (Number(user.balance) < amount) {
        throw new BadRequestException('Insufficient balance for withdrawal');
      }
    }

    /**
     * $transaction runs both operations atomically.
     * If balance update fails → funding record is rolled back.
     * If funding create fails → balance is NOT touched.
     * Either both succeed or neither does.
     */
    const [funding] = await this.prisma.$transaction([
      this.prisma.funding.create({
        data: {
          userId,
          type,
          asset,
          amount,
          status: 'completed', // ← completed immediately, not pending
          reference: randomUUID(),
        },
        include: {
          user: {
            select: {
              email: true,
              walletAddress: true,
              username: true,
            },
          },
        },
      }),

      this.prisma.user.update({
        where: { id: userId },
        data: {
          balance: {
            ...(type === 'deposit'
              ? { increment: amount } // deposit → balance goes UP
              : { decrement: amount }), // withdrawal → balance goes DOWN
          },
        },
      }),
    ]);

    return funding;
  }

  async findAll(userId: string) {
    return this.prisma.funding.findMany({
      where: { userId },
      include: {
        user: {
          select: {
            email: true,
            balance: true,
            walletAddress: true,
            username: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' }, // newest first
    });
  }

  async findOne(id: string, userId: string) {
    const funding = await this.prisma.funding.findUnique({
      where: { id: userId },
      include: {
        user: {
          select: {
            email: true,
            balance: true,
            walletAddress: true,
            username: true,
          },
        },
      },
    });

    if (!funding || funding.userId !== userId) {
      throw new NotFoundException(`Funding record not found`);
    }

    return funding;
  }
}
