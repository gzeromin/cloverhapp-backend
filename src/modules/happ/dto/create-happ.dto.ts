import { PickType } from '@nestjs/swagger';
import { Happ } from '@/entities/happ.entity';

export class CreateHappDto extends PickType(Happ, [
  'UserStamp',
  'memo',
  'imageUrls',
  'money',
  'moneyUnit',
  'water',
  'startTime',
  'endTime',
  'todo',
  'status',
  'Tags',
  'Friends',
  'Book',
  'bookPercent',
] as const) {
  copy: Date[];
}
