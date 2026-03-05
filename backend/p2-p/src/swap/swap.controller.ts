import {
  Controller,
  Get,
  Post,
  Body,
  ValidationPipe,
  UseGuards,
} from '@nestjs/common';
import { SwapService } from './swap.service';
import { CreateSwapDto } from './dto/create-swap.dto';

import { CurrentUser } from 'src/users/decorator/current-user.decorator';
import { JwtAuthGuard } from 'src/auth/guard/jwt.guard';
import { ApiBearerAuth } from '@nestjs/swagger';

@Controller('swap')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
export class SwapController {
  constructor(private readonly swapService: SwapService) {}

  @Post()
  create(
    @CurrentUser() user: { id: string },
    @Body(ValidationPipe) createSwapDto: CreateSwapDto,
  ) {
    return this.swapService.create(user.id, createSwapDto); // userId from JWT
  }

  @Get('History')
  findByUser(@CurrentUser() user: { id: string }) {
    return this.swapService.findByUser(user.id);
  }
}
