import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';
import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString } from 'class-validator';

export class UpdateProfileDto {
  @ApiProperty({
    example: 'john_doe@example.com',
    description: 'The email of the user',
  })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiProperty({ example: 'John Doe', description: 'The name of the user' })
  @IsString()
  @IsOptional()
  username?: string;

  @ApiProperty({ example: 'P@ssw0rd', description: 'The password of the user' })
  @IsString()
  @IsOptional()
  password?: string;
}
