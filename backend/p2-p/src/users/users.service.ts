// users.service.ts
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { UpdateProfileDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        email: true,
        username: true,
        balance: true,
        wallets: {
          select: {
            balance: true,
          },
        },
        walletAddress: true,
      },
    });

    if (!user) throw new NotFoundException('User not found');

    return user;
  }

  async updateProfile(userId: string, update: UpdateProfileDto) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });

    if (!user) throw new NotFoundException('User not found');

    let hashedPassword = user.hashedPassword;
    if (update.password) {
      const bcrypt = await import('bcrypt');
      hashedPassword = await bcrypt.hash(update.password, 10);
    }

    const updatedFields: string[] = [];
    if (update.email) updatedFields.push('email');
    if (update.username) updatedFields.push('username');
    if (update.password) updatedFields.push('password');

    if (updatedFields.length === 0) {
      throw new BadRequestException('No fields provided to update');
    }

    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: {
        ...(update.email && { email: update.email }),
        ...(update.username && { username: update.username }),
        ...(update.password && { hashedPassword }),
      },
      select: {
        id: true,
        email: true,
        username: true,
        balance: true,
        wallets: {
          select: {
            balance: true,
          },
        },
        walletAddress: true,
        createdAt: true,
      },
    });

    return {
      message: `Successfully updated: ${updatedFields.join(', ')}`,
      user: updatedUser,
    };
  }
  async getUserById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        username: true,
        balance: true,
        wallets: {
          select: {
            balance: true,
          },
        },
        walletAddress: true,
        createdAt: true,
      },
    });

    if (!user) throw new NotFoundException(`User with id ${id} not found`);

    return user;
  }

  async getAllUsers() {
    return this.prisma.user.findMany({
      select: {
        id: true,
        email: true,
        username: true,
        balance: true,
        wallets: {
          select: {
            balance: true,
          },
        },
        walletAddress: true,
        createdAt: true,
      },
    });
  }
}
