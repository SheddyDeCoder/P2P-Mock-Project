import { Body, Controller, Get, Param, Patch, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guard/jwt.guard';
import { EscrowService } from './escrow.service';
import { UpdateEscrowDto } from './dto/update-escrow.dto';
import { RolesGuard } from 'src/auth/guard/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';

@ApiTags('Escrow')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('escrow')
export class EscrowController {
  constructor(private readonly escrowService: EscrowService) {}

  @Get('trade/:tradeId')
  @Roles('admin', 'moderator')
  @ApiOperation({ summary: 'Get escrow by trade ID' })
  findByTrade(@Param('tradeId') tradeId: string) {
    return this.escrowService.findByTrade(tradeId);
  }

  @Get(':id')
  @Roles('admin', 'moderator')
  @ApiOperation({ summary: 'Get escrow by ID' })
  findOne(@Param('id') id: string) {
    return this.escrowService.findOne(id);
  }

  @Patch(':id')
  @Roles('admin', 'moderator')
  @ApiOperation({ summary: 'Update escrow status (release or dispute)' })
  updateStatus(
    @Param('id') id: string,
    @Body() updateEscrowDto: UpdateEscrowDto,
  ) {
    return this.escrowService.updateStatus(id, updateEscrowDto);
  }
}
