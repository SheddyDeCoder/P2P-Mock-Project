import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CreateFundingDto } from './dto/create-funding.dto';
import { FundingService } from './funding.service';
import { JwtAuthGuard } from 'src/auth/guard/jwt.guard';
import { CurrentUser } from 'src/users/decorator/current-user.decorator';

@ApiTags('Funding')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('funding')
export class FundingController {
  constructor(private readonly fundingService: FundingService) {}

  @Post()
  @ApiOperation({ summary: 'Create a funding entry' })
  create(
    @CurrentUser() user: { id: string; email: string; username: string },
    @Body() dto: CreateFundingDto,
  ) {
    return this.fundingService.create(String(user.id), dto);
    //                                ↑ JWT sub is number, Prisma userId is String
    //                                  String() safely converts it
  }

  @Get()
  @ApiOperation({ summary: 'Get all my funding entries' })
  findAll(@CurrentUser() user: { id: string }) {
    return this.fundingService.findAll(String(user.id));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single funding entry by ID' })
  findOne(@Param('id') id: string, @CurrentUser() user: { id: string }) {
    return this.fundingService.findOne(id, String(user.id));
  }
}
