import { PickType } from '@nestjs/swagger';
import { User } from '../../../entities/user.entity';

export class SignInDto extends PickType(User, [
  'email',
  'password',
  'locale',
] as const) {}
