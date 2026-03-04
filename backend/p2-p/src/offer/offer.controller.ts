import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ValidationPipe,
} from '@nestjs/common';
import { OfferService } from './offer.service';
import { CreateOfferDto } from './dto/create-offer.dto';

@Controller('offers')
export class OfferController {
  constructor(private readonly offerService: OfferService) {}

  @Post()
  create(@Body(ValidationPipe) createOfferDto: CreateOfferDto) {
    return this.offerService.create(createOfferDto);
  }

  @Get()
  getAllOffers() {
    return this.offerService.getAllOffers();
  }
}
