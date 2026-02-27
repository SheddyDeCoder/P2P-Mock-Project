import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto) {
    const { username, wallet_address } = createUserDto;

    const existing = await this.prisma.user.findUnique({
      where: { walletAddress: wallet_address },
    });
    if (existing) {
      return { message: 'User with the given wallet address already exists' };
    }

    const user = await this.prisma.user.create({
      data: {
        username,
        walletAddress: wallet_address,
      },
      select: {
        id: true,
        username: true,
        walletAddress: true,
      },
    });
    return { message: 'User created successfully', user };
  }
}
