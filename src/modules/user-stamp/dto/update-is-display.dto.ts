import { UserStamp } from '@/entities/user-stamp.entity';
import { PickType } from '@nestjs/swagger';

export class UpdateIsDisplayDto extends PickType(UserStamp, [
  'id',
  'userId',
  'isDisplay',
] as const) {
  from: number;
  to: number;
  oldIsDisplay: boolean;
}
