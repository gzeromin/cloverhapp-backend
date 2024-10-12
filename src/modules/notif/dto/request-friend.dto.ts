import { Notif } from '@/entities/notif.entity';
import { PickType } from '@nestjs/swagger';

export class RequestFriendDto extends PickType(Notif, [
  'senderId',
  'receiverId',
] as const) {
  myAlias: string;
  friendAlias: string;
  requestMessage: string;
}
