import { PickType } from '@nestjs/swagger';
import { User } from '../../../entities/user.entity';

export class KeyValueDto extends PickType(User, ['keyValues'] as const) {}
