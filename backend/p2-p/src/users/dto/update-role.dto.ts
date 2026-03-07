import { ApiProperty } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { IsEnum } from 'class-validator';

export class UpdateRoleDto {
  @ApiProperty({
    example: Role.admin,
    enum: Role,
    description: 'The role to assign to the user',
  })
  @IsEnum(Role)
  role: Role;
}
