import { Injectable } from '@nestjs/common';
import { CreateOfferDto } from './dto/create-offer.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class OfferService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string | null, createOfferDto: CreateOfferDto) {
    const { type, asset, price } = createOfferDto;

    if (userId) {
      const user = await this.prisma.user.findUnique({ where: { id: userId } });
      if (!user) {
        return { message: `User with the given ID ${userId} does not exist` };
      }
    }

    const offer = await this.prisma.offer.create({
      data: {
        type,
        asset,
        price,
        ...(userId ? { userId } : {}),
      } as any, // bypass Prisma's strict type checking
      select: {
        id: true,
        type: true,
        asset: true,
        price: true,
        createdAt: true,
      },
    });
    return { message: 'Offer created successfully', offer };
  }

  async getAllOffers() {
    return this.prisma.offer.findMany({
      where: { status: 'active' },
      select: {
        id: true,
        userId: true,
        type: true,
        asset: true,
        price: true,
        createdAt: true,
      },
    });
  }
}
