import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { SignUpDto } from './dto/signUp-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { PrismaService } from 'prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { generateWalletAddress } from 'src/utils/address.utils';

@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService) {}

  async create(signUpDto: SignUpDto) {
    const { email, password, username } = signUpDto;

    const foundUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (foundUser) {
      throw new Error('User with this email already exists');
    }

    const hashedPassword = await this.hashPassword(password);

    let walletAddress = generateWalletAddress(10);
    let attempts = 0;

    while (
      await this.prisma.user.findUnique({
        where: { walletAddress },
      })
    ) {
      if (attempts++ > 5) {
        throw new InternalServerErrorException(
          'Failed to generate unique account number',
        );
      }
      walletAddress = generateWalletAddress(10);
    }

    const user = this.prisma.user.create({
      data: {
        email,
        walletAddress,
        hashedPassword,
        username,
      },
      select: {
        email: true,
        username: true,
      },
    });
    return { message: 'User created successfully' };
  }

  findAll() {
    return `This action returns all auth`;
  }

  findOne(id: number) {
    return `This action returns a #${id} auth`;
  }

  update(id: number, updateAuthDto: UpdateAuthDto) {
    return `This action updates a #${id} auth`;
  }

  remove(id: number) {
    return `This action removes a #${id} auth`;
  }

  async hashPassword(password: string): Promise<string> {
    const saltOrRounds = 10;
    return await bcrypt.hash(password, saltOrRounds);
  }
}
