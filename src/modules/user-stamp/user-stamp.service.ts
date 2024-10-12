import { UserStamp } from '@/entities/user-stamp.entity';
import { User } from '@/entities/user.entity';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { SaveUserStampDto } from './dto/save-user-stamp.dto';
import { UpdateUserStampDto } from './dto/update-user-stamp.dto';
import { UpdateIsDisplayDto } from './dto/update-is-display.dto';
import { Tag } from '@/entities/tag.entity';

@Injectable()
export class UserStampService {
  constructor(
    @InjectRepository(UserStamp)
    private userStampRepository: Repository<UserStamp>,
    @InjectRepository(Tag)
    private tagRepository: Repository<Tag>,
    private readonly dataSource: DataSource, // 트랜잭션 처리를 위해 DataSource 사용
  ) {}

  async getAllUserStamps(userId: string): Promise<UserStamp[]> {
    try {
      const result = await this.userStampRepository.find({
        where: { userId, deleteFlag: false },
        relations: ['Stamp', 'Book'],
        order: { displayOrder: 'ASC' },
      });
      return result;
    } catch (error) {
      console.log(error);
    }
  }

  async getDisplayUserStamps(userId: string): Promise<UserStamp[]> {
    try {
      const query = this.userStampRepository.createQueryBuilder('userStamp');
      query.leftJoinAndSelect('userStamp.Stamp', 'Stamp').where(
        `userStamp.userId = :userId 
        AND userStamp.deleteFlag =: deleteFlag
        AND userStamp.isDisplay =: isDisplay
        AND Stamp.type Not In (:notShow)`,
        { userId, deleteFlag: false, isDisplay: true },
      );
      const result = await this.userStampRepository.find({
        where: {
          userId,
          deleteFlag: false,
          isDisplay: true,
        },
        relations: ['Stamp'],
        order: { displayOrder: 'ASC' },
      });
      return result;
    } catch (error) {
      console.log(error);
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
      console.log(error);
    }
  }

  async getUserStampById(id: string): Promise<UserStamp> {
    return await this.userStampRepository.findOne({
      where: { id, deleteFlag: false },
      relations: ['Stamp', 'Book'],
    });
  }

  async saveUserStamp(user: User, data: SaveUserStampDto): Promise<number> {
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

      // 4. 업데이트된 User 정보 조회
      const updatedUser = await queryRunner.manager.findOne(User, {
        where: { id: user.id },
      });

      // 5. 트랜잭션 커밋
      await queryRunner.commitTransaction();

      return updatedUser.droplet;
    } catch (error) {
      // 오류 발생 시 롤백
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      // 트랜잭션 종료
      await queryRunner.release();
    }
  }

  async updateUserStamp(
    id: string,
    data: UpdateUserStampDto,
  ): Promise<UserStamp> {
    const userStamp = await this.userStampRepository.findOneBy({ id });
    const { Tags } = data;
    userStamp.alias = data.alias;
    userStamp.memo = data.memo;
    userStamp.isDisplay = data.isDisplay;
    userStamp.displayOrder = data.displayOrder;
    userStamp.status = data.status;
    if (Tags) {
      // 태그목록 추가
      const newTags = await Promise.all(
        Tags.map(async (e) => {
          if (!e.id) {
            return await this.tagRepository.save(e);
          }
          return e;
        }),
      );
      userStamp.Tags = newTags;
    }
    userStamp.Friends = data.Friends;
    userStamp.existGoal = data.existGoal;
    userStamp.goalUnit = data.goalUnit;
    userStamp.goalInterval = data.goalInterval;
    userStamp.goalNumber = data.goalNumber;
    return await this.userStampRepository.save(userStamp);
  }

  async updateIsDisplay(
    updateIsDisplayDto: UpdateIsDisplayDto,
  ): Promise<UserStamp> {
    const { id, userId, isDisplay, from, to, oldIsDisplay } =
      updateIsDisplayDto;
    // 트랜잭션 시작
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      if (isDisplay == oldIsDisplay) {
        // 1. isDisplay 상태 변경 없이 순서만 바꾸는 경우
        // 1-1. 4번째 스탬프를 임시로 -1로 설정하여 충돌 방지
        await queryRunner.manager
          .createQueryBuilder()
          .update(UserStamp)
          .set({ displayOrder: -1 }) // 임시 값으로 변경
          .where('userId = :userId', { userId })
          .andWhere('displayOrder = :from', { from })
          .andWhere('isDisplay = :isDisplay', { isDisplay })
          .execute();

        if (from < to) {
          // 1-2. 기존 스탬프들의 displayOrder를 1씩 감소 (from번째 -> to번째 스탬프들을 내림)
          await queryRunner.manager
            .createQueryBuilder()
            .update(UserStamp)
            .set({ displayOrder: () => `"displayOrder" - 1` })
            .where('userId = :userId', { userId })
            .andWhere('displayOrder > :from', { from })
            .andWhere('displayOrder < :to', { to })
            .andWhere('isDisplay = :isDisplay', { isDisplay })
            .execute();
        } else {
          // 1-3. 기존 스탬프들의 displayOrder를 1씩 증가 (to번째 -> from번째 사이의 스탬프들을 올림)
          await queryRunner.manager
            .createQueryBuilder()
            .update(UserStamp)
            .set({ displayOrder: () => `"displayOrder" + 1` })
            .where('userId = :userId', { userId })
            .andWhere('displayOrder >= :to', { to })
            .andWhere('displayOrder < :from', { from })
            .andWhere('isDisplay = :isDisplay', { isDisplay })
            .execute();
        }

        // 1-3. 임시로 -1로 설정한 스탬프의 displayOrder를 to로 업데이트
        await queryRunner.manager
          .createQueryBuilder()
          .update(UserStamp)
          .set({ displayOrder: to })
          .where('userId = :userId AND displayOrder = -1', { userId })
          .execute();
      } else {
        // 2. isDisplay 상태도 바뀌고 순서도 바뀌는 경우
        // 2-1. 빠지는 쪽
        await queryRunner.manager
          .createQueryBuilder()
          .update(UserStamp)
          .set({ isDisplay: () => `"isDisplay" - 1` })
          .where('userId = :userId', { userId })
          .andWhere('displayOrder > :from', { from })
          .andWhere('isDisplay > :oldIsDisplay', { oldIsDisplay })
          .execute();

        // 2-2. 들어가는 쪽
        await queryRunner.manager
          .createQueryBuilder()
          .update(UserStamp)
          .set({ isDisplay: () => `"isDisplay" + 1` })
          .where('userId = :userId', { userId })
          .andWhere('displayOrder > :to', { to })
          .andWhere('isDisplay > :isDisplay', { isDisplay })
          .execute();

        // 2-3. 해당 유저 스탬프 갱신
        await queryRunner.manager
          .createQueryBuilder()
          .update(UserStamp)
          .set({ displayOrder: to, isDisplay })
          .where('id = :id', { id })
          .execute();
      }
      // 트랜잭션 커밋
      await queryRunner.commitTransaction();

      return;
    } catch (error) {
      // 오류 발생 시 롤백
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      // 트랜잭션 종료
      await queryRunner.release();
    }
  }

  async deleteUserStamp(id: string): Promise<UserStamp> {
    const userStamp = await this.userStampRepository.findOneBy({ id });
    if (!userStamp) {
      throw new NotFoundException(`Can't find Stamp with id ${id}`);
    }
    userStamp.deleteFlag = true;
    return await this.userStampRepository.save(userStamp);
  }
}
