import { Notif } from '@/entities/notif.entity';
import { PickType } from '@nestjs/swagger';

export class AcceptRequestDto extends PickType(Notif, [
  'id',
  'senderId',
  'receiverId',
] as const) {
  myAlias: string;
  friendAlias: string;
}
