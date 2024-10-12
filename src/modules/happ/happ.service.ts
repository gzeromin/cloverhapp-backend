import {
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/entities/user.entity';
import { Repository } from 'typeorm';
import { Happ } from '../../entities/happ.entity';
import { CreateHappDto } from './dto/create-happ.dto';
import { UpdateHappDto } from './dto/update-happ.dto';
import { UpdateByDndDto } from './dto/update-by-dnd.dto';
import { CreateHappByDndDto } from './dto/create-happ-by-dnd.dto';
import { getPosition, isFuture } from '@/utils/date.util';
import { TodoStatus } from '@/enums/todo-status.enum';
import { Tag } from '@/entities/tag.entity';
import { s3DeleteFile } from '@/utils/multerS3.util';
import { ConfigService } from '@nestjs/config';
import { UserStamp } from '@/entities/user-stamp.entity';
import { Stamp } from '@/entities/stamp.entity';
import { StampType } from '@/enums/stamp-type.enum';
import { MoneyUnit } from '@/enums/money-unit.enum';
import { UpdateHappResDto } from './dto/updated-happ-res-dto';
import { Book } from '@/entities/book.entity';

@Injectable()
export class HappService {
  constructor(
    @InjectRepository(Happ)
    private happRepository: Repository<Happ>,
    @InjectRepository(UserStamp)
    private userStampRepository: Repository<UserStamp>,
    @InjectRepository(Stamp)
    private stampRepository: Repository<Stamp>,
    @InjectRepository(Tag)
    private tagRepository: Repository<Tag>,
    @InjectRepository(Book)
    private bookRepository: Repository<Book>,
    private configService: ConfigService,
  ) {}
  private logger = new Logger('HappService');

  async getAllHapps(page: string, count: string): Promise<Happ[]> {
    const currentPage: number = (page || 0) as number;
    const perPage: number = (count || 10) as number;
    try {
      const happs = await this.happRepository
        .createQueryBuilder('happ')
        .leftJoinAndSelect('happ.User', 'User')
        .leftJoinAndSelect('happ.UserStamp', 'UserStamp')
        .leftJoinAndSelect('UserStamp.Stamp', 'Stamp')
        .orderBy('happ.createdAt', 'DESC')
        .skip(currentPage * perPage)
        .take(perPage)
        .getMany();

      // const comments = await this.commentRepository.find({
      //   where: { happId: In(happs.map((v) => v.id)) },
      //   relations: ['User'],
      //   order: { createdAt: 'DESC' },
      // });

      // happs.forEach((happ) => {
      //   happ.Comments = comments.filter(
      //     (comment) => comment.happId === happ.id,
      //   );
      // });

      return happs;
    } catch (error) {
      console.log(error);
    }
  }

  async getAllHappsByUserId(
    page: string,
    count: string,
    userId: string,
  ): Promise<Happ[]> {
    const currentPage: number = (page || 0) as number;
    const perPage: number = (count || 8) as number;
    try {
      const happs = await this.happRepository
        .createQueryBuilder('happ')
        .leftJoinAndSelect('happ.User', 'User')
        .leftJoinAndSelect('happ.UserStamp', 'UserStamp')
        .leftJoinAndSelect('happ.Book', 'Book')
        .leftJoinAndSelect('UserStamp.Stamp', 'Stamp')
        .where({ userId })
        .orderBy('happ.startTime', 'DESC')
        .skip(currentPage * perPage)
        .take(perPage)
        .getMany();

      // const comments = await this.commentRepository.find({
      //   where: { happId: In(happs.map((v) => v.id)) },
      //   relations: ['User'],
      //   order: { createdAt: 'DESC' },
      // });

      // happs.forEach((happ) => {
      //   happ.Comments = comments.filter(
      //     (comment) => comment.happId === happ.id,
      //   );
      // });

      return happs;
    } catch (error) {
      console.log(error);
    }
  }

  async getHappsByDate(fullDate: string, userId: string): Promise<Happ[]> {
    const date = new Date(fullDate);

    // 3개월 전
    const startDate = new Date(date);
    startDate.setMonth(startDate.getMonth() - 3);

    // 1주일 후
    const endDate = new Date(date);
    endDate.setDate(endDate.getDate() + 8);

    const query = this.happRepository.createQueryBuilder('happ');
    query
      .leftJoinAndSelect('happ.UserStamp', 'UserStamp')
      .leftJoinAndSelect('happ.Book', 'Book')
      .leftJoinAndSelect('UserStamp.Stamp', 'Stamp')
      .where(
        `happ.userId = :userId 
       AND happ.startTime BETWEEN :startDate AND :endDate`,
        { userId, startDate, endDate },
      );

    const result = await query.getMany();
    return result;
  }

  async getHappById(id: string): Promise<Happ> {
    const query = this.happRepository.createQueryBuilder('happ');
    query
      .leftJoinAndSelect('happ.Tags', 'Tags')
      .leftJoinAndSelect('happ.UserStamp', 'UserStamp')
      .leftJoinAndSelect('UserStamp.Stamp', 'Stamp')
      .leftJoinAndSelect('happ.Book', 'Book')
      .leftJoinAndSelect('happ.Friends', 'Friends')
      .leftJoinAndSelect('Friends.Friend', 'Friend')
      .where(`happ.id = :id`, { id });
    const found = await query.getOne();
    if (!found) {
      throw new NotFoundException(`Can't find Happ with id ${id}`);
    }

    // const comments = await this.commentRepository.find({
    //   where: { happId: found.id },
    //   relations: ['User'],
    //   order: { createdAt: 'DESC' },
    // });

    // 코멘트 가져오기
    // found.Comments = comments;
    return found;
  }

  async createHapp(createHappDto: CreateHappDto, user: User): Promise<Happ[]> {
    const {
      UserStamp,
      memo,
      imageUrls,
      money,
      moneyUnit,
      water,
      startTime,
      endTime,
      todo,
      copy,
      status,
      Tags,
      Friends,
      Book,
      bookPercent,
    } = createHappDto;
    try {
      const { positionX, positionY } = getPosition(startTime);
      const happList: Happ[] = [];
      const happ = this.happRepository.create({
        userStampId: UserStamp.id,
        userId: user.id,
        memo,
        startTime,
        endTime,
        positionX,
        positionY,
        imageUrls,
        money,
        moneyUnit,
        water,
        todo,
        status,
      });
      happ.UserStamp = UserStamp;
      happ.User = user;
      happ.Friends = Friends;
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
        happ.Tags = newTags;
      }

      if (Book) {
        if (!Book.id) {
          const savedBook = await this.bookRepository.findOneBy({
            isbn: Book.isbn,
          });
          if (savedBook) {
            happ.Book = savedBook;
          } else {
            const newBook = this.bookRepository.create(Book);
            const savedNewBook = await this.bookRepository.save(newBook);
            happ.Book = savedNewBook;
          }
        } else {
          happ.Book = Book;
        }
        happ.bookPercent = bookPercent;
        const userStamp = happ.UserStamp;
        userStamp.Book = happ.Book;
        userStamp.bookPercent = happ.bookPercent;
        console.log(userStamp);
        // UserStamp 갱신
        await this.userStampRepository.save(userStamp);
        happ.UserStamp.Book = Book;
      }

      happList.push(happ);
      if (copy) {
        copy.forEach((time) => {
          const newHapp = { ...happ };
          const { positionX, positionY } = getPosition(time);
          newHapp.positionX = positionX;
          newHapp.positionY = positionY;
          newHapp.startTime = time;
          newHapp.endTime = time;
          const newTime = new Date(time);
          newHapp.todo = isFuture(newTime)
            ? TodoStatus.TODO
            : TodoStatus.NOT_TODO;
          const createdNewHapp = this.happRepository.create(newHapp);
          happList.push(createdNewHapp);
        });
      }

      // save Happ
      return await this.happRepository.save(happList);
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException();
    }
  }

  async createHappByDnd(
    createHappByDndDto: CreateHappByDndDto,
    user: User,
  ): Promise<Happ> {
    const { UserStamp, startTime, positionX, positionY } = createHappByDndDto;
    const newStartTime = new Date(startTime);
    try {
      const happ: Happ = this.happRepository.create({
        UserStamp,
        userId: user.id,
        startTime,
        endTime: startTime,
        moneyUnit: user.locale.toString() as MoneyUnit,
        positionX,
        positionY,
        todo: isFuture(newStartTime) ? TodoStatus.TODO : TodoStatus.NOT_TODO,
      });
      if (UserStamp.Stamp.type === StampType.WATER) {
        happ.water = '10';
      }
      await this.happRepository.save(happ);
      happ.UserStamp = UserStamp;
      happ.User = user;
      return happ;
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException();
    }
  }

  async updateHapp(updateHappDto: UpdateHappDto): Promise<UpdateHappResDto> {
    try {
      const {
        id,
        UserStamp,
        startTime,
        endTime,
        memo,
        imageUrls,
        uploadedImages,
        money,
        moneyUnit,
        water,
        todo,
        copy,
        status,
        Tags,
        Friends,
        Book,
        bookPercent,
      } = updateHappDto;
      const happList: Happ[] = [];
      const happ = await this.getHappById(id);
      happ.startTime = startTime;
      happ.endTime = endTime;
      happ.memo = memo;
      happ.money = money;
      happ.moneyUnit = moneyUnit;
      happ.water = water;
      happ.todo = todo;
      happ.status = status;
      happ.Friends = Friends;

      // 이미지 리스트 추가
      if (
        happ.imageUrls &&
        ((uploadedImages && uploadedImages.length > 0) ||
          (imageUrls && imageUrls.length == 0))
      ) {
        // 보유 중인 사진 삭제
        await s3DeleteFile(this.configService, happ.imageUrls);
      }

      if (uploadedImages && uploadedImages.length > 0) {
        happ.imageUrls = uploadedImages;
      } else if (imageUrls && imageUrls.length == 0) {
        happ.imageUrls = imageUrls;
      }

      let deletedTags = [];
      // 삭제된 태그 아이디들
      if (Tags) {
        deletedTags = happ.Tags.filter((oldTag) =>
          Tags.every((newTag) => newTag.id !== oldTag.id),
        );
        // 태그목록 추가
        const newTags = await Promise.all(
          Tags.map(async (e) => {
            if (!e.id) {
              return await this.tagRepository.save(e);
            }
            return e;
          }),
        );
        happ.Tags = newTags;
      }

      // UPDATE
      this.happRepository.save(happ);

      if (copy) {
        copy.forEach((time) => {
          const newHapp = { ...happ };
          const { positionX, positionY } = getPosition(time);
          newHapp.id = undefined;
          newHapp.positionX = positionX;
          newHapp.positionY = positionY;
          newHapp.startTime = time;
          newHapp.endTime = time;
          newHapp.UserStamp = UserStamp;
          const newTime = new Date(time);
          newHapp.todo = isFuture(newTime)
            ? TodoStatus.TODO
            : TodoStatus.NOT_TODO;
          const createdNewHapp = this.happRepository.create(newHapp);
          happList.push(createdNewHapp);
        });
      }

      // 삭제된 태그가 현재 사용중인지 검색
      deletedTags.forEach(async (e) => {
        // 태그를 사용하는 스탬프 수 조회
        const count1 = await this.happRepository
          .createQueryBuilder('happ')
          .leftJoinAndSelect('happ.Tags', 'tag') // stamp 엔터티와 Tags 관계를 조인합니다
          .where('tag.id = :tagId', { tagId: e.id }) // tag.id가 특정 태그의 ID와 일치하는지 확인합니다
          .getCount();
        const count2 = await this.userStampRepository
          .createQueryBuilder('userStamp')
          .leftJoinAndSelect('userStamp.Tags', 'tag') // stamp 엔터티와 Tags 관계를 조인합니다
          .where('tag.id = :tagId', { tagId: e.id }) // tag.id가 특정 태그의 ID와 일치하는지 확인합니다
          .getCount();
        const count3 = await this.stampRepository
          .createQueryBuilder('stamp')
          .leftJoinAndSelect('stamp.Tags', 'tag') // stamp 엔터티와 Tags 관계를 조인합니다
          .where('tag.id = :tagId', { tagId: e.id }) // tag.id가 특정 태그의 ID와 일치하는지 확인합니다
          .getCount();

        const count = count1 + count2 + count3;
        // 사용 중이지 않은 태그인 경우 삭제
        if (count === 0) {
          await this.tagRepository.delete(e.id);
        }
      });

      // CREATE
      const created = await this.happRepository.save(happList);
      return { updated: happ, created };
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException();
    }
  }

  async updateByDnd(updateByDndDto: UpdateByDndDto): Promise<Happ> {
    const { id, startTime, positionX, positionY } = updateByDndDto;
    const happ = await this.getHappById(id);
    happ.startTime = startTime;
    happ.endTime = startTime;
    happ.positionX = positionX;
    happ.positionY = positionY;

    // 스탬프 저장(비동기)
    this.happRepository.save(happ);
    return happ;
  }

  async completeTodo(id: string): Promise<Happ> {
    const happ = await this.getHappById(id);
    if (happ.todo === TodoStatus.TODO) {
      happ.todo = TodoStatus.COMPLETE;
      // 스탬프 저장(비동기)
      this.happRepository.save(happ);
    } else {
      // TODO
    }
    return happ;
  }

  async deleteHapp(id: string, user: User): Promise<void> {
    try {
      const happ = await this.happRepository.findOne({
        where: { id, User: { id: user.id } },
      });
      if (!happ) {
        throw new NotFoundException(`Can't find Happ with id ${id}`);
      }
      // 보유 중인 사진 삭제
      if (happ.imageUrls) {
        await s3DeleteFile(this.configService, happ.imageUrls);
      }
      await this.happRepository.delete({ id, User: { id: user.id } });
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException();
    }
  }
}
