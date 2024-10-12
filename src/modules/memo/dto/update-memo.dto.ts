import { PickType } from '@nestjs/swagger';
import { Memo } from '@/entities/memo.entity';

export class UpdateMemoDto extends PickType(Memo, ['id', 'content'] as const) {}
