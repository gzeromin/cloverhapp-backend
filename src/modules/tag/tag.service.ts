import { Tag } from '@/entities/tag.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class TagService {
  constructor(
    @InjectRepository(Tag)
    private tagRepository: Repository<Tag>,
  ) {}

  async getTag(page: string, term: string): Promise<Tag[]> {
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
      console.log(error);
    }
  }
}
