import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';
import { TradesModule } from './trades/trades.module';

@Module({
  imports: [UsersModule, TradesModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
