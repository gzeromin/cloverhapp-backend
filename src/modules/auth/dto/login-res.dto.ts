import { User } from '../../../entities/user.entity';
import { UserStamp } from '@/entities/user-stamp.entity';

export class loginResDto {
  user: User;
  userStamps: UserStamp[];
}
