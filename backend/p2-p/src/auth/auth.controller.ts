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
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register-auth.dto';
import { LoginDto } from './dto/loginDto.dto';
import { ApiProperty } from '@nestjs/swagger';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  create(@Body(ValidationPipe) registerDto: RegisterDto) {
    return this.authService.create(registerDto);
  }

  @Post('login')
  login(@Body(ValidationPipe) loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Delete('logout/:id')
  @ApiProperty({ example: '1', description: 'The ID of the user to logout' })
  logout(@Param('id', ValidationPipe) id: string) {
    return this.authService.logout(id);
  }
}
