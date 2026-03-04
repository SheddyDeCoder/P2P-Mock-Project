import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class LoginDto {
  @ApiProperty({
    example: 'john_doe@example.com',
    description: 'The registered email of this user',
  })
  @IsString()
  email: string;

  @ApiProperty({ example: 'P@ssw0rd', description: 'The password of the user' })
  @IsString()
  password: string;
}
