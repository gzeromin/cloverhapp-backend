import { Tag } from '@/entities/tag.entity';
import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';

@Injectable()
export class TagService {
  constructor(
    @InjectRepository(Tag)
    private tagRepository: Repository<Tag>,
  ) {}
  private logger = new Logger('TagService');

  async getTags(page: string, term: string): Promise<Tag[]> {
    const currentPage: number = (page || 0) as number;
    const perPage = 10;
    try {
      const query = this.tagRepository
        .createQueryBuilder('tag')
        .orderBy({ 'tag.name': 'ASC' })
        .skip(currentPage * perPage)
        .take(perPage);

      if (term) {
        query.where(`tag.name ILIKE :term`, {
          term: `%${term}%`,
        });
      }
      return await query.getMany();
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException(error);
    }
  }

  async saveTagList(tagList: Tag[]): Promise<Tag[]> {
    try {
      // 이미 존재하는 태그인지 확인하기
      const existTags = await this.tagRepository.findBy({
        name: In(tagList.filter((f) => !f.id).map((e) => e.name)),
      });
      // 태그목록 추가
      const newTags = tagList.map((e) => {
        const existTag = existTags.filter((f) => f.name === e.name);
        if (existTag.length > 0) {
          const countUpTag = existTag[0];
          countUpTag.enrolledCount += 1;
          e = countUpTag;
        }
        if (e.id) {
          e.enrolledCount += 1;
        } else {
          e = this.tagRepository.create(e);
        }
        return e;
      });
      return await this.tagRepository.save(newTags);
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException(error);
    }
  }

  async countDownTagList(tagList: Tag[]): Promise<Tag[]> {
    try {
      // CountDown Tag EnrolledCount
      const countDownTags = tagList.map((e) => ({
        ...e,
        enrolledCount: e.enrolledCount - 1,
      }));
      return await this.tagRepository.save(countDownTags);
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException(error);
    }
  }
}
