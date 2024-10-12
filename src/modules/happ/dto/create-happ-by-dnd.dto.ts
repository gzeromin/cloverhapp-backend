import { PickType } from '@nestjs/swagger';
import { Happ } from '@/entities/happ.entity';

export class CreateHappByDndDto extends PickType(Happ, [
  'UserStamp',
  'startTime',
  'positionX',
  'positionY',
] as const) {}
