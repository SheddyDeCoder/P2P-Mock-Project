import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ValidationPipe,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register-auth.dto';
import { LoginDto } from './dto/loginDto.dto';
import { ApiBearerAuth, ApiProperty, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from './guard/jwt.guard';
import { Roles } from './decorators/roles.decorator';
// import { RegisterAdminDto } from './dto/register-admin.dto';
import { ApiBody } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  create(@Body(ValidationPipe) registerDto: RegisterDto) {
    return this.authService.create(registerDto);
  }

  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Post('login')
  login(@Body(ValidationPipe) loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @Roles('admin', 'user')
  @Delete('logout/:id')
  @ApiProperty({ example: '1', description: 'The ID of the user to logout' })
  logout(@Param('id', ValidationPipe) id: string) {
    return this.authService.logout(id);
  }

  // @Post('seed-moderator')
  // @ApiBody({ type: RegisterAdminDto })
  // seedModerator(@Body(ValidationPipe) dto: RegisterAdminDto) {
  //   if (dto.secretKey !== 'my-secret-123') {
  //     throw new Error('Unauthorized');
  //   }
  //   return this.authService.createModerator(dto);
  // }
}
