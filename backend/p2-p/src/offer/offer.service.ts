import { Injectable } from '@nestjs/common';
import { CreateOfferDto } from './dto/create-offer.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class OfferService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, createOfferDto: CreateOfferDto) {
    const { type, asset, price } = createOfferDto;

    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return { message: `User with the given ID ${userId} does not exist` };
    }

    const offer = await this.prisma.offer.create({
      data: {
        userId,
        type,
        asset,
        price,
      },
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
      select: {
        id: true,
        type: true,
        asset: true,
        price: true,
        createdAt: true,
      },
    });
  }
}
