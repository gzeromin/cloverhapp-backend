import { PickType } from '@nestjs/swagger';
import { Memo } from '@/entities/memo.entity';

export class CreateMemoDto extends PickType(Memo, [
  'content',
  'userId',
] as const) {}
