import { PickType } from '@nestjs/swagger';
import { Stamp } from '@/entities/stamp.entity';

export class CreateStampDto extends PickType(Stamp, [
  'name',
  'description',
  'droplet',
  'type',
  'status',
  'Tags',
  'notForSale',
] as const) {}
