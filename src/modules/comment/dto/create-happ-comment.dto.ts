import { Comment } from '@/entities/comment.entity';
import { PickType } from '@nestjs/swagger';

export class CreateHappCommentDto extends PickType(Comment, [
  'happId',
  'body',
  'User',
] as const) {}
