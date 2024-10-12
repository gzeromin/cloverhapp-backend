import { Body, Controller, Logger, Post } from '@nestjs/common';
import { CommentService } from './comment.service';
import { Comment } from '@/entities/comment.entity';
import { CreateHappCommentDto } from './dto/create-happ-comment.dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('comment')
@Controller('comment')
export class CommentController {
  constructor(private commentService: CommentService) {}
  private logger = new Logger('CommentController');

  @Post('/happ')
  createHappComment(
    @Body() createHappCommentDto: CreateHappCommentDto,
  ): Promise<Comment> {
    return this.commentService.createHappComment(createHappCommentDto);
  }
}
