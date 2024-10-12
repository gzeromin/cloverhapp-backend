import { PickType } from '@nestjs/swagger';
import { User } from '../../../entities/user.entity';

export class SentenceDto extends PickType(User, ['sentence'] as const) {}
