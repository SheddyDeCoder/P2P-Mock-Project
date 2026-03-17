import {
  Controller,
  Get,
  Post,
  Body,
  ValidationPipe,
  UseGuards,
} from '@nestjs/common';
import { OfferService } from './offer.service';
import { CreateOfferDto } from './dto/create-offer.dto';
import { JwtAuthGuard } from 'src/auth/guard/jwt.guard';
import { ApiBearerAuth } from '@nestjs/swagger/dist/decorators/api-bearer.decorator';
import { CurrentUser } from 'src/users/decorator/current-user.decorator';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { RolesGuard } from 'src/auth/guard/roles.guard';

@Controller('offers')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
export class OfferController {
  constructor(private readonly offerService: OfferService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  create(
    @CurrentUser() user: { id: string },
    @Body(ValidationPipe) createOfferDto: CreateOfferDto,
  ) {
    return this.offerService.create(user.id, createOfferDto);
  }

  @Get()
  getAllOffers() {
    return this.offerService.getAllOffers();
  }
}
