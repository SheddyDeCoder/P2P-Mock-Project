import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { RegisterDto } from './dto/register-auth.dto';
import { LoginDto } from './dto/loginDto.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { generateWalletCode } from './utils/walletAddress.utils';
import { Role } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
  ) {}

  async create(registerDto: RegisterDto) {
    const { email, username, password } = registerDto;

    const emailExists = await this.prisma.user.findUnique({ where: { email } });
    if (emailExists) {
      return { message: 'Email already exists' };
    }

    const usernameExists = await this.prisma.user.findFirst({
      where: { username },
    });
    if (usernameExists) {
      return { message: 'Username already exists' };
    }

    const hashedPassword = await this.hashPassword(password);

    let walletAddress = generateWalletCode(42);
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
      walletAddress = generateWalletCode(42);
    }

    await this.prisma.user.create({
      data: {
        email,
        username,
        hashedPassword,
        walletAddress,
      },
    });
    return {
      message: 'User created successfully',
    };
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    const user = await this.prisma.user.findUnique({ where: { email } });

    if (!user) {
      return { message: 'Invalid email or password' };
    }

    const passwordMatch = await this.comparePassword({
      password,
      hashedPassword: user.hashedPassword,
    });

    if (!passwordMatch) {
      return { message: 'Invalid email or password' };
    }

    const token = await this.generateToken({
      sub: user.id,
      email: user.email,
      role: user.role as Role,
      username: user.username,
    });

    return {
      message: 'Login successful',
      token,
      role: user.role,
    };
  }

  async logout(id: string) {
    await this.prisma.user.delete({ where: { id } });
    return { message: 'Logout successful' };
  }

  async hashPassword(password: string): Promise<string> {
    const saltRounds = 10;
    return await bcrypt.hash(password, saltRounds);
  }

  async comparePassword(args: {
    password: string;
    hashedPassword: string;
  }): Promise<boolean> {
    return await bcrypt.compare(args.password, args.hashedPassword);
  }

  async generateToken(payload: {
    sub: string;
    email: string;
    username: string | null;
    role: Role;
  }): Promise<string> {
    return this.jwt.signAsync(payload);
  }
}
