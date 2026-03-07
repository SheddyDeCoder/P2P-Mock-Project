import {
  Controller,
  Patch,
  Body,
  ValidationPipe,
  Get,
  UseGuards,
  Param,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from 'src/auth/guard/jwt.guard';
import { ApiBearerAuth } from '@nestjs/swagger/dist/decorators/api-bearer.decorator';
import { ApiOperation } from '@nestjs/swagger';
import { CurrentUser } from './decorator/current-user.decorator';
import { RolesGuard } from 'src/auth/guard/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { UpdateProfileDto } from './dto/update-user.dto';
import { UpdateRoleDto } from './dto/update-role.dto';

@Controller('users')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('profile')
  @ApiOperation({ summary: 'Get my profile' })
  getProfile(@CurrentUser() user: { id: string }) {
    return this.usersService.getProfile(user.id);
  }

  @Patch('profile')
  @Roles('admin', 'user')
  @ApiOperation({ summary: 'Update my profile' })
  updateProfile(
    @CurrentUser() user: { id: string },
    @Body(ValidationPipe) dto: UpdateProfileDto,
  ) {
    return this.usersService.updateProfile(user.id, dto);
  }

  @Patch(':id/role')
  @Roles('admin')
  @ApiOperation({ summary: 'Update user role — admin only' })
  updateRole(@Param('id') id: string, @Body() dto: UpdateRoleDto) {
    return this.usersService.updateRole(id, dto.role);
  }

  @Get(':id')
  @Roles('admin')
  @ApiOperation({ summary: 'Get user by ID' })
  getUserById(@Param('id') id: string) {
    return this.usersService.getUserById(id);
  }

  @Get()
  @Roles('admin')
  @ApiOperation({ summary: 'Get all users' })
  getAllUsers() {
    return this.usersService.getAllUsers();
  }
}
