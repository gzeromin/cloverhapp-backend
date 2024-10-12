import { UserStamp } from '@/entities/user-stamp.entity';
import { PickType } from '@nestjs/swagger';

export class UpdateUserStampDto extends PickType(UserStamp, [
  'alias',
  'memo',
  'isDisplay',
  'displayOrder',
  'status',
  'Tags',
  'Friends',
  'existGoal',
  'goalUnit',
  'goalInterval',
  'goalNumber',
] as const) {}
