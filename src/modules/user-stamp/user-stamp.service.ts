import { UserStamp } from '@/entities/user-stamp.entity';
import { User } from '@/entities/user.entity';
import {
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { SaveUserStampDto } from './dto/save-user-stamp.dto';
import { UpdateUserStampDto } from './dto/update-user-stamp.dto';
import { SaveUserStampResDto } from './dto/save-user-stamp-res.dto';
import { TagService } from '../tag/tag.service';

@Injectable()
export class UserStampService {
  constructor(
    @InjectRepository(UserStamp)
    private userStampRepository: Repository<UserStamp>,
    private readonly tagService: TagService,
    private readonly dataSource: DataSource, // 트랜잭션 처리를 위해 DataSource 사용
  ) {}
  private logger = new Logger('UserStampService');

  async getAllUserStamps(userId: string): Promise<UserStamp[]> {
    try {
      const result = await this.userStampRepository.find({
        where: { userId, deleteFlag: false },
        relations: ['Stamp', 'Book'],
        order: { displayOrder: 'ASC' },
      });
      return result;
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException();
    }
  }

  async getUserStampsPerPage(
    userId: string,
    page: string,
    count: string,
  ): Promise<UserStamp[]> {
    const currentPage: number = (page || 0) as number;
    const perPage: number = (count || 10) as number;
    try {
      return await this.userStampRepository.find({
        where: { userId, deleteFlag: false },
        relations: ['Stamp'],
        order: { createdAt: 'DESC' },
        skip: currentPage * perPage,
        take: perPage,
      });
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException();
    }
  }

  async getUserStampById(id: string): Promise<UserStamp> {
    return await this.userStampRepository.findOne({
      where: { id, deleteFlag: false },
      relations: ['Stamp', 'Book'],
    });
  }

  async saveUserStamp(
    user: User,
    data: SaveUserStampDto,
  ): Promise<SaveUserStampResDto> {
    // 트랜잭션 시작
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 1. user한테 droplet차감
      const userDroplet = user.droplet - data.droplet;
      await queryRunner.manager
        .createQueryBuilder()
        .update(User)
        .set({ droplet: userDroplet })
        .where('id = :userId', { userId: user.id })
        .execute();

      // 2. 판매자한테 droplet가산
      const registerUser = await queryRunner.manager
        .createQueryBuilder(User, 'user')
        .where('user.id = :userId', { userId: data.registerId })
        .getOne();
      const registerDroplet = registerUser.droplet + data.droplet;
      await queryRunner.manager
        .createQueryBuilder()
        .update(User)
        .set({ droplet: registerDroplet })
        .where('id = :userId', { userId: registerUser.id })
        .execute();

      // 3. 새로운 UserStamp 생성
      const userStamp = queryRunner.manager.create(UserStamp, {
        stampId: data.stampId,
        userId: user.id,
        alias: data.name,
        memo: data.description,
        status: data.stampStatus,
      });

      // 2. 기존의 모든 스탬프의 isDisplay 값을 +1 증가
      await queryRunner.manager
        .createQueryBuilder()
        .update(UserStamp)
        .set({ displayOrder: () => `"displayOrder" + 1` }) // SQL에서 isDisplay 값을 1씩 증가
        .where('userId = :userId AND isDisplay = :isDisplay', {
          userId: user.id,
          isDisplay: true,
        })
        .execute();

      // 3. 새로운 UserStamp 저장
      await queryRunner.manager.save(userStamp);

      // 4. 저장된 UserStamps 조회
      const userStamps = await queryRunner.manager.find(UserStamp, {
        where: { userId: user.id, deleteFlag: false },
        relations: ['Stamp', 'Book'],
        order: { displayOrder: 'ASC' },
      });

      // 5. 업데이트된 User 정보 조회
      const updatedUser = await queryRunner.manager.findOne(User, {
        where: { id: user.id },
      });

      // 6. 트랜잭션 커밋
      await queryRunner.commitTransaction();

      return { droplet: updatedUser.droplet, userStamps };
    } catch (error) {
      // 오류 발생 시 롤백
      await queryRunner.rollbackTransaction();
      this.logger.error(error);
      throw new InternalServerErrorException();
    } finally {
      // 트랜잭션 종료
      await queryRunner.release();
    }
  }

  async updateUserStamp(
    id: string,
    data: UpdateUserStampDto,
  ): Promise<UserStamp[]> {
    const userStamp = await this.userStampRepository.findOneBy({ id });
    const { Tags } = data;
    userStamp.alias = data.alias;
    userStamp.memo = data.memo;
    userStamp.isDisplay = data.isDisplay;
    userStamp.displayOrder = data.displayOrder;
    userStamp.status = data.status;
    if (Tags) {
      userStamp.Tags = await this.tagService.saveTagList(Tags);
    }
    userStamp.Friends = data.Friends;
    userStamp.existGoal = data.existGoal;
    userStamp.goalUnit = data.goalUnit;
    userStamp.goalInterval = data.goalInterval;
    userStamp.goalNumber = data.goalNumber;
    await this.userStampRepository.save(userStamp);
    return await this.getAllUserStamps(userStamp.userId);
  }

  async deleteUserStamp(id: string): Promise<UserStamp[]> {
    const userStamp = await this.userStampRepository.findOneBy({ id });
    if (!userStamp) {
      throw new NotFoundException(`Can't find UserStamp with id ${id}`);
    }
    userStamp.deleteFlag = true;
    await this.userStampRepository.save(userStamp);
    return await this.getAllUserStamps(userStamp.userId);
  }
}
