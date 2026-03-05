import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';
import { TradesModule } from './trades/trades.module';
import { EscrowModule } from './escrow/escrow.module';
import { OfferModule } from './offer/offer.module';
import { AuthModule } from './auth/auth.module';
import { FundingModule } from './funding/funding.module';
import { SwapModule } from './swap/swap.module';

@Module({
  imports: [AuthModule, UsersModule, OfferModule, TradesModule, EscrowModule, FundingModule, SwapModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
