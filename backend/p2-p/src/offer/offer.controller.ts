import { Controller, Get, Post, Body, ValidationPipe } from '@nestjs/common';
import { OfferService } from './offer.service';
import { CreateOfferDto } from './dto/create-offer.dto';
import { CurrentUser } from 'src/users/decorator/current-user.decorator';
import { Public } from 'src/auth/decorators/public.decorator';

@Public()
@Controller('offers')
export class OfferController {
  constructor(private readonly offerService: OfferService) {}

  @Post()
  create(
    @CurrentUser() user: { id: string } | undefined,
    @Body(ValidationPipe) createOfferDto: CreateOfferDto,
  ) {
    return this.offerService.create(user?.id ?? null, createOfferDto);
  }

  @Get()
  getAllOffers() {
    return this.offerService.getAllOffers();
  }
}
