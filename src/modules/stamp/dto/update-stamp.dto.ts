import { PickType } from '@nestjs/swagger';
import { Stamp } from '@/entities/stamp.entity';

export class UpdateStampDto extends PickType(Stamp, [
  'id',
  'name',
  'description',
  'droplet',
  'type',
  'status',
  'Tags',
  'notForSale',
] as const) {}
