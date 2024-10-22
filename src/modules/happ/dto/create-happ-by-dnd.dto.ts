import { Happ } from '@/entities/happ.entity';
import { PickType } from '@nestjs/swagger';

export class CreateHappByDndDto extends PickType(Happ, [
  'UserStamp',
  'startTime',
  'positionX',
  'positionY',
] as const) {}
