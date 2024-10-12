import { PickType } from '@nestjs/swagger';
import { User } from '../../../entities/user.entity';

export class ChangeLocaleDto extends PickType(User, ['locale'] as const) {}
