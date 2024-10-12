import { Memo } from '@/entities/memo.entity';
import { getFirstDateOfWeek, getLastDateOfWeek } from '@/utils/date.util';
import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateMemoDto } from './dto/create-memo.dto';
import { UpdateMemoDto } from './dto/update-memo.dto';
import { User } from '@/entities/user.entity';

@Injectable()
export class MemoService {
  constructor(
    @InjectRepository(Memo)
    private memoRepository: Repository<Memo>,
  ) {}

  async getMemosByWeek(fullDate: string, userId: string): Promise<Memo[]> {
    const date = new Date(fullDate);

    // 주의 시작과 끝 (월요일부터 일요일까지)
    const startOfTheWeek = getFirstDateOfWeek(date);
    const endOfTheWeek = getLastDateOfWeek(date);

    const query = this.memoRepository.createQueryBuilder('memo');
    query.where(
      `memo.userId = :userId 
        AND memo.createdAt BETWEEN :startOfTheWeek AND :endOfTheWeek`,
      {
        userId,
        startOfTheWeek,
        endOfTheWeek,
      },
    );

    return await query.getMany();
  }

  async createMemo(createMemoDto: CreateMemoDto): Promise<Memo> {
    const { content, userId } = createMemoDto;
    try {
      const memo = this.memoRepository.create({
        content,
        userId,
      });
      // save Happ
      return await this.memoRepository.save(memo);
    } catch (error) {
      throw new InternalServerErrorException();
    }
  }
  async updateMemo(updateMemoDto: UpdateMemoDto): Promise<Memo> {
    const { id, content } = updateMemoDto;
    const memo = await this.memoRepository.findOneBy({ id });
    memo.content = content;

    // 스탬프 저장
    return await this.memoRepository.save(memo);
  }

  async deleteMemo(id: string, user: User): Promise<void> {
    const result = await this.memoRepository.delete({
      id,
      userId: user.id,
    });

    if (result.affected === 0) {
      throw new NotFoundException(`Can't find Memo with id ${id}`);
    }
  }
}
