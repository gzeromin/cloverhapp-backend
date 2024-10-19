import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcryptjs';
import { Response } from 'express';
import { In, Not, QueryFailedError, Repository } from 'typeorm';
import { User } from '../../entities/user.entity';
import { SignInDto } from './dto/sign-in.dto';
import { SignUpDto } from './dto/sign-up.dto';
import { FormException } from '@/exceptions/form.exception';
import $t from '@utils/message.util';
import { ChangePasswordDto } from './dto/change-password.dto';
import { ChangeLocaleDto } from './dto/chagne-locale.dto';
import { Locale } from '@/enums/user-locale.enum';
import { ChangeNicknameDto } from './dto/chagne-nickname.dto';
import formErrorUtils from '@/utils/form-error.utils';
import { Notif } from '@/entities/notif.entity';
import { UserStamp } from '@/entities/user-stamp.entity';
import { Stamp } from '@/entities/stamp.entity';
import { Friend } from '@/entities/friend.entity';
import { WithdrawalDto } from './dto/withdrawal.dto';
import { ConfigService } from '@nestjs/config';
import { s3DeleteFile } from '@/utils/multerS3.util';
import { LoginException } from '@/exceptions/login.exception';
import { Happ } from '@/entities/happ.entity';
import { KeyValueDto } from './dto/key-value.dto';
import { SentenceDto } from './dto/sentence.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    @InjectRepository(Notif) private notifRepository: Repository<Notif>,
    @InjectRepository(Happ)
    private happRepository: Repository<Happ>,
    @InjectRepository(Stamp)
    private stampRepository: Repository<Stamp>,
    @InjectRepository(UserStamp)
    private userStampRepository: Repository<UserStamp>,
    @InjectRepository(Friend)
    private friendRepository: Repository<Friend>,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async getAllUsers(user: User, page: string, term: string): Promise<User[]> {
    const currentPage: number = (page || 0) as number;
    const perPage = 10;
    try {
      // 이미 친구인 유저목록
      const friendIds = (
        await this.friendRepository.findBy({
          userId: user.id,
        })
      ).map((friend) => friend.friendId);

      // 친구 신청중인 유저목록
      const requestingIds = (
        await this.notifRepository.findBy({
          senderId: user.id,
        })
      ).map((notif) => notif.receiverId);

      // 친구 신청받은 유저목록
      const requestedIds = (
        await this.notifRepository.findBy({
          receiverId: user.id,
        })
      ).map((notif) => notif.senderId);

      // 제외할 유저ID들을 합칩니다.
      const excludedUserIds = [
        user.id,
        ...friendIds,
        ...requestingIds,
        ...requestedIds,
      ];

      const query = this.userRepository
        .createQueryBuilder('user')
        .where({
          id: Not(In(excludedUserIds)), // 제외할 유저ID들을 사용하여 필터링합니다.
        })
        .orderBy({ nickname: 'ASC' })
        .skip(currentPage * perPage)
        .take(perPage);

      if (term) {
        query.where(`user.nickname ILIKE :term OR user.email ILIKE :term`, {
          term: `%${term}%`,
        });
      }
      // 제외할 유저ID들을 사용하여 쿼리를 실행합니다.
      const users = await query.getMany();

      return users;
    } catch (error) {
      console.log(error);
    }
  }

  async createUser(
    signUpDto: SignUpDto,
    response: Response,
  ): Promise<{ user: User }> {
    const { email, nickname, password, locale } = signUpDto;

    const user = this.userRepository.create({
      email,
      nickname,
      password,
      locale,
    });

    try {
      const createdUser = await this.userRepository.save(user);
      // 유저 토큰 생성 (Secret + Payload)
      const payload = { email };
      const token = await this.jwtService.sign(payload);
      response.cookie('token', token, {
        httpOnly: true,
        maxAge: parseInt(process.env.JWT_EXPIRES_IN, 10),
        path: '/',
      });

      delete createdUser.password;

      // 기본 스탬프 무료 제공
      const basicStamps = await this.stampRepository.findBy({
        notForSale: true,
      });

      let order = 0;
      const userStamps = basicStamps.map((stamp) => {
        order += 1;
        return this.userStampRepository.create({
          stampId: stamp.id,
          userId: createdUser.id,
          alias: stamp.name,
          memo: stamp.description,
          displayOrder: order,
          status: stamp.status,
        });
      });

      await this.userStampRepository.save(userStamps);

      return { user: createdUser };
    } catch (error) {
      if (error instanceof QueryFailedError) {
        const errorMessages = [(error.driverError as any).detail];
        const keys = [
          'nickname',
          'email',
          'password',
          'locale',
          'passwordConfirm',
        ];
        throw new FormException(formErrorUtils(keys, errorMessages, locale));
      } else {
        throw new InternalServerErrorException();
      }
    }
  }

  async signIn(
    signInDto: SignInDto,
    response: Response,
  ): Promise<{ user: User }> {
    const { email, password, locale } = signInDto;
    const user = await this.userRepository.findOneBy({ email });

    if (user && (await bcrypt.compare(password, user.password))) {
      // 유저 토큰 생성 (Secret + Payload)
      const payload = { email };
      const token = await this.jwtService.sign(payload);
      response.cookie('token', token, {
        httpOnly: true,
        maxAge: parseInt(process.env.JWT_EXPIRES_IN, 10),
        path: '/',
      });

      delete user.password;

      const notifNum = await this.notifRepository.countBy({
        receiverId: user.id,
      });
      user.notifNum = notifNum;

      return { user };
    } else {
      throw new LoginException($t(locale).LoginFailed);
    }
  }

  async getById(userId: string): Promise<User> {
    const user = await this.userRepository.findOneBy({ id: userId });

    if (user) {
      return user;
    } else {
      throw new NotFoundException();
    }
  }

  async changePassword(
    user: User,
    changePasswordDto: ChangePasswordDto,
  ): Promise<{ user: User }> {
    const { oldPassword, password } = changePasswordDto;
    if (user && (await bcrypt.compare(oldPassword, user.password))) {
      user.password = password;
      await this.userRepository.save(user);
      return { user };
    } else {
      throw new FormException([
        {
          field: 'oldPassword',
          message: $t(user.locale).ChangePasswordFailed,
        },
      ]);
    }
  }

  async changeLocale(
    user: User,
    changeLocaleDto: ChangeLocaleDto,
  ): Promise<{ locale: Locale }> {
    const { locale } = changeLocaleDto;
    await this.userRepository.update(user.id, { locale });
    return { locale };
  }

  async changeNickname(
    user: User,
    changeLocaleDto: ChangeNicknameDto,
  ): Promise<{ nickname: string }> {
    const nickname = changeLocaleDto.nickname.replace('\b', '');
    if (nickname == user.nickname) {
      const formError = [
        {
          field: 'input',
          message: $t(user.locale).FormError.EqualNickname.replace(
            '{value}',
            nickname,
          ),
        },
      ];
      throw new FormException(formError);
    }
    try {
      await this.userRepository.update(user.id, { nickname });
    } catch (error) {
      if (error instanceof QueryFailedError) {
        const errorMessages = [(error.driverError as any).detail];
        throw new FormException(
          formErrorUtils(['nickname'], errorMessages, user.locale),
        );
      } else {
        throw new InternalServerErrorException();
      }
    }
    return { nickname };
  }

  async updateKeyValue(user: User, keyValueDto: KeyValueDto): Promise<void> {
    try {
      const { keyValues } = keyValueDto;
      await this.userRepository.update(user.id, { keyValues });
    } catch (error) {
      throw new InternalServerErrorException();
    }
  }

  async updateSentence(user: User, sentenceDto: SentenceDto): Promise<void> {
    try {
      const { sentence } = sentenceDto;
      await this.userRepository.update(user.id, { sentence });
    } catch (error) {
      throw new InternalServerErrorException();
    }
  }

  async deleteUser(user: User, withdrawalDto: WithdrawalDto): Promise<number> {
    try {
      if (
        user &&
        (await bcrypt.compare(withdrawalDto.password, user.password))
      ) {
        // 친구 삭제
        await this.friendRepository
          .createQueryBuilder()
          .delete()
          .where('userId = :userId', { userId: user.id })
          .orWhere('friendId = :friendId', { friendId: user.id })
          .execute();

        // Happ 삭제
        await this.happRepository.delete({ userId: user.id });

        // UserStamp 삭제
        await this.userStampRepository.delete({ userId: user.id });

        // 알림 삭제
        await this.notifRepository
          .createQueryBuilder()
          .delete()
          .where('senderId = :senderId', { senderId: user.id })
          .orWhere('receiverId = :receiverId', { receiverId: user.id })
          .execute();

        // 데이터베이스 정보 삭제
        await this.userRepository.delete(user.id);

        // 보유 중인 프로필 사진 삭제
        if (user.photoUrl) {
          await s3DeleteFile(this.configService, [user.photoUrl]);
        }

        return 0;
      } else {
        throw new FormException([
          {
            field: 'input',
            message: $t(user.locale).ChangePasswordFailed,
          },
        ]);
      }
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async updatePhotoUrl(
    user: User,
    filePath: string,
  ): Promise<{ filePath: string }> {
    await this.userRepository.update(user.id, { photoUrl: filePath });
    return { filePath };
  }

  async deletePhoto(user: User): Promise<void> {
    try {
      // 보유 중인 프로필 사진 삭제
      await s3DeleteFile(this.configService, [user.photoUrl]);
      await this.userRepository.update(user.id, { photoUrl: null });
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
}
