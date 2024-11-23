import { AuthService } from '@/modules/auth/auth.service';
import { Test, TestingModule } from '@nestjs/testing';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '@/entities/user.entity';
import { Notif } from '@/entities/notif.entity';
import { Stamp } from '@/entities/stamp.entity';
import { UserStamp } from '@/entities/user-stamp.entity';
import { Friend } from '@/entities/friend.entity';
import { ConfigService } from '@nestjs/config';
import { Response } from 'express';
import { SignUpDto } from '@/modules/auth/dto/sign-up.dto';
import { Locale } from '@/enums/user-locale.enum';
import { readJson } from '../../utils/readJson';
import { Happ } from '@/entities/happ.entity';
import { FormException } from '@/exceptions/form.exception';
import formErrorUtils from '@/utils/form-error.utils';
import { InternalServerErrorException } from '@nestjs/common';

describe('AuthService', () => {
  let service: AuthService;
  let userRepository: Repository<User>;
  let stampRepository: Repository<Stamp>;
  let userStampRepository: Repository<UserStamp>;
  let jwtService: JwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        ConfigService,
        {
          provide: getRepositoryToken(User),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(Notif),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(Happ),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(Stamp),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(UserStamp),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(Friend),
          useClass: Repository,
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
    stampRepository = module.get<Repository<Stamp>>(getRepositoryToken(Stamp));
    userStampRepository = module.get<Repository<UserStamp>>(
      getRepositoryToken(UserStamp),
    );
    jwtService = module.get<JwtService>(JwtService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // 메소드 명
  describe('createUser', () => {
    let signUpDto: SignUpDto;
    let response: Response;
    let createdUser: User;

    beforeEach(() => {
      signUpDto = readJson(SignUpDto, './test/fixtures/auth/signUpDto.json');

      response = {
        cookie: jest.fn(),
      } as any;

      createdUser = {
        email: signUpDto.email,
        nickname: signUpDto.nickname,
        password: signUpDto.password,
        locale: Locale.Kr,
      } as User;
    });

    it('성공적으로 유저 생성하는 케이스', async () => {
      // Given

      jest.spyOn(userRepository, 'create').mockReturnValueOnce(createdUser);
      jest
        .spyOn(userRepository, 'save')
        .mockResolvedValueOnce({ ...createdUser, id: 'userId' } as any);
      jest.spyOn(jwtService, 'sign').mockReturnValue('mockedToken');
      jest.spyOn(stampRepository, 'findBy').mockResolvedValueOnce([]);
      jest.spyOn(userStampRepository, 'save').mockResolvedValueOnce(null);

      const result = await service.createUser(signUpDto, response);

      // 패스워드 지워졌는지 확인하기
      expect(result.password).toBeUndefined();

      // 결과 확인
      expect(result).toEqual(
        expect.objectContaining({
          email: signUpDto.email,
          nickname: signUpDto.nickname,
        }),
      );
    });

    it('이미 등록된 닉네임 저장할 때 폼에러가 발생하는 케이스', async () => {
      // Given
      createdUser.nickname = 'exisitinguser';
      signUpDto.nickname = 'exisitinguser';
      const keys = ['nickname'];
      const errorMessages = ['Key (nickname)=(exisitinguser) already exists.'];

      // Mock
      jest.spyOn(userRepository, 'findBy').mockResolvedValueOnce([createdUser] as User[]); // 이미 'testuser'라는 nickname이 존재한다고 가정
      jest.spyOn(userRepository, 'create').mockImplementation(() => {
        throw new FormException(formErrorUtils(keys, errorMessages, Locale.Kr));
      });

      const result = service.createUser(signUpDto, response);
      // 결과확인
      await expect(result).rejects.toThrow(FormException);
    });

    it('시스템 에러 발생하는 케이스', async () => {
      // mockup -> save error
      jest.spyOn(userRepository, 'create').mockReturnValueOnce(createdUser);
      jest.spyOn(userRepository, 'save').mockImplementation(() => {
        throw new Error('Database error');
      });

      // createUser
      const result = service.createUser(signUpDto, response);
      // Then
      // 500
      await expect(result).rejects.toThrow(InternalServerErrorException);
    });
  });
});
