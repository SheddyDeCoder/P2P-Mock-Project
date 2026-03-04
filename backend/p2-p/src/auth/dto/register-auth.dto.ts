import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString } from 'class-validator';

export class RegisterDto {
  @ApiProperty({
    example: 'john_doe@example.com',
    description: 'The email of the user',
  })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'John Doe', description: 'The name of the user' })
  @IsString()
  username: string;

  @ApiProperty({ example: 'P@ssw0rd', description: 'The password of the user' })
  @IsString()
  password: string;
}
