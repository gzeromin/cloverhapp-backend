import { PickType } from '@nestjs/swagger';
import { Happ } from '@/entities/happ.entity';

export class UpdateByDndDto extends PickType(Happ, [
  'id',
  'startTime',
  'positionX',
  'positionY',
] as const) {}
