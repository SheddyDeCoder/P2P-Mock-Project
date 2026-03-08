import { Injectable, OnModuleInit, OnApplicationShutdown } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnApplicationShutdown {
  private static instance: PrismaService;

  constructor() {
    if (PrismaService.instance) {
      return PrismaService.instance;
    }
    super({
      log: ['query', 'info', 'warn', 'error'], // optional for dev
    });
    PrismaService.instance = this;
  }

  async onModuleInit() {
    await this.$connect();
    console.log('✅ Prisma connected');
  }

  async onApplicationShutdown(signal?: string) {
    await this.$disconnect();
    console.log('🔌 Prisma disconnected');
  }
}