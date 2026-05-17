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
import { CreateSwapDto } from './dto/create-swap.dto';
import { SwapService } from './swap.service';
import { JwtAuthGuard } from 'src/auth/guard/jwt.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { RolesGuard } from 'src/auth/guard/roles.guard';

@ApiTags('Swap')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('swap')
export class SwapController {
  constructor(private readonly swapService: SwapService) {}

  @Post()
  @Roles('admin', 'user', 'moderator')
  @ApiOperation({ summary: 'Swap between balance and asset wallet' })
  create(
    @CurrentUser() user: { id: string },
    @Body(ValidationPipe) createSwapDto: CreateSwapDto,
  ) {
    return this.swapService.create(user.id, createSwapDto);
  }

  @Get('history')
  @Roles('admin', 'user', 'moderator')
  @ApiOperation({ summary: 'Get my swap history' })
  findByUser(@CurrentUser() user: { id: string }) {
    return this.swapService.findByUser(user.id);
  }
}
