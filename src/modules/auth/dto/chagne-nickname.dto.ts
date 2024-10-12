import { PickType } from '@nestjs/swagger';
import { User } from '../../../entities/user.entity';

export class ChangeNicknameDto extends PickType(User, ['nickname'] as const) {}
