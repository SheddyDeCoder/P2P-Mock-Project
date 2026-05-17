import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';
import { TradesModule } from './trades/trades.module';
import { EscrowModule } from './escrow/escrow.module';
import { OfferModule } from './offer/offer.module';
import { AuthModule } from './auth/auth.module';
import { FundingModule } from './funding/funding.module';
import { SwapModule } from './swap/swap.module';
import { WalletModule } from './wallet/wallet.module';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';

@Module({
  imports: [
    AuthModule,
    UsersModule,
    OfferModule,
    TradesModule,
    EscrowModule,
    FundingModule,
    SwapModule,
    PrismaModule,
    WalletModule,
    ThrottlerModule.forRoot([
      {
        ttl: 60000, // 1 minute in ms
        limit: 10, // max 10 requests per ttl
      },
    ]),
  ],
  controllers: [],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard, // applies globally
    },
  ],
})
export class AppModule {}
