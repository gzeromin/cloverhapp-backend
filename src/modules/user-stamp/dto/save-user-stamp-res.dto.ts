import { UserStamp } from '@/entities/user-stamp.entity';

export class SaveUserStampResDto {
  droplet: number;
  userStamps: UserStamp[];
}
