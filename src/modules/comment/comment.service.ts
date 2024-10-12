import { Comment } from '@/entities/comment.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateHappCommentDto } from './dto/create-happ-comment.dto';

@Injectable()
export class CommentService {
  constructor(
    @InjectRepository(Comment)
    private commentRepository: Repository<Comment>,
  ) {}

  async createHappComment(
    createHappCommentDto: CreateHappCommentDto,
  ): Promise<Comment> {
    const { happId, body, User } = createHappCommentDto;

    const comment = this.commentRepository.create({
      userId: User.id,
      body,
      happId,
    });

    try {
      const createdComment = await this.commentRepository.save(comment);
      createdComment.User = User;
      return createdComment;
    } catch (error) {
      console.log(error);
    }
  }
}
