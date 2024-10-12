import { PickType } from '@nestjs/swagger';
import { User } from '../../../entities/user.entity';
import { IsNotEmpty, IsString } from 'class-validator';

export class SignUpDto extends PickType(User, [
  'nickname',
  'email',
  'password',
  'locale',
] as const) {
  @IsString()
  @IsNotEmpty()
  passwordConfirm: string;
}
