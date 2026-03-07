import {
  Body,
  Controller,
  Get,
  Post,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from 'src/users/decorator/current-user.decorator';
import { WalletService } from './wallet.service';
import { CreateWalletDto } from './dto/create-wallet.dto';
import { JwtAuthGuard } from 'src/auth/guard/jwt.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { RolesGuard } from 'src/auth/guard/roles.guard';

@ApiTags('Wallet')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('wallet')
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  @Post()
  @Roles('admin', 'user')
  @ApiOperation({ summary: 'Fund a wallet by wallet address' })
  create(
    @CurrentUser() user: { id: string },
    @Body(ValidationPipe) dto: CreateWalletDto,
  ) {
    return this.walletService.create(user.id, dto);
  }

  @Get()
  @Roles('admin', 'user')
  @ApiOperation({ summary: 'Get all my asset wallet balances' })
  getWallets(@CurrentUser() user: { id: string }) {
    return this.walletService.getWallets(user.id);
  }
}
