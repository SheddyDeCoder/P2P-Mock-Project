import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';
import { TradesModule } from './trades/trades.module';
import { EscrowModule } from './escrow/escrow.module';
import { OfferModule } from './offer/offer.module';

@Module({
  imports: [UsersModule, TradesModule, EscrowModule, OfferModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
