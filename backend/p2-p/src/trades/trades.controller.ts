import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  ValidationPipe,
  UseGuards,
} from '@nestjs/common';
import { TradesService } from './trades.service';
import { CreateTradeDto } from './dto/create-trade.dto';
import { ApiBearerAuth, ApiOperation, ApiProperty } from '@nestjs/swagger';
import { UpdateTradeStatusDto } from './dto/update-trade.dto';
import { JwtAuthGuard } from 'src/auth/guard/jwt.guard';
import { CurrentUser } from 'src/users/decorator/current-user.decorator';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { RolesGuard } from 'src/auth/guard/roles.guard';
import { Public } from 'src/auth/decorators/public.decorator';

@Controller('trades')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TradesController {
  constructor(private readonly tradesService: TradesService) {}

  @Post()
  @Public()
  @ApiOperation({ summary: 'Create a trade against your active offer' })
  create(
    @CurrentUser() user: { id: string } | undefined,
    @Body(ValidationPipe) createTradeDto: CreateTradeDto,
  ) {
    return this.tradesService.create(user?.id ?? null, createTradeDto);
  }

  @Patch(':id/status')
  @Public()
  @ApiProperty({
    example: '1',
    description: 'The ID of the trade to update the status for',
  })
  updateStatus(
    @Param('id') id: string,
    @Body(ValidationPipe) updateTradeStatusDto: UpdateTradeStatusDto,
  ) {
    return this.tradesService.updateTradeStatus(
      id,
      updateTradeStatusDto.status,
    );
  }

  @Get()
  @Roles('admin', 'moderator')
  findAll() {
    return this.tradesService.findAll();
  }

  @Get('my-trades')
  @Public()
  @ApiOperation({ summary: 'Get all my trades' })
  findAllMyTrade(@CurrentUser() user: { id: string } | undefined) {
    return this.tradesService.findAllMyTrade(user?.id ?? null);
  }
}
