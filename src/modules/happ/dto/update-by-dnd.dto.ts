import { Happ } from '@/entities/happ.entity';
import { PickType } from '@nestjs/swagger';

export class UpdateByDndDto extends PickType(Happ, [
  'id',
  'startTime',
  'positionX',
  'positionY',
] as const) {}
