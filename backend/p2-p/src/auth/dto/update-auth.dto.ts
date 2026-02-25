import { PartialType } from '@nestjs/swagger';
import { SignInDto } from './signIn.dto';

export class UpdateAuthDto extends PartialType(SignInDto) {}
