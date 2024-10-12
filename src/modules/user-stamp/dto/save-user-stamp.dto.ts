import { UserStamp } from '@/entities/user-stamp.entity';
import { StampStatus } from '@/enums/stamp-status.enum';
import { PickType } from '@nestjs/swagger';

export class SaveUserStampDto extends PickType(UserStamp, [
  'stampId',
] as const) {
  stampStatus: StampStatus;
  registerId: string;
  droplet: number;
  name: string;
  description: string;
}
