import { AppModule } from '@/app.module';
import { AuthController } from '@/modules/auth/auth.controller';
import { SignUpDto } from '@/modules/auth/dto/sign-up.dto';
import { PasswordCheckPipe } from '@/modules/auth/pipe/password-check.pipe';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { readJson } from '../../utils/readJson';
import { UserStampService } from '@/modules/user-stamp/user-stamp.service';
import { AuthService } from '@/modules/auth/auth.service';
import { Locale } from '@/enums/user-locale.enum';
import { Repository } from 'typeorm';
import { User } from '@/entities/user.entity';
import { getRepositoryToken } from '@nestjs/typeorm';

describe('AuthController (e2e)', () => {
  let app: INestApplication;
  // let controller: AuthController;
  let userRepository: Repository<User>;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule], // Root app module containing the AuthModule
      providers: [
        {
          provide: UserStampService,
          useValue: { // UserStampService를 모킹하여 테스트에 사용
            someMethod: jest.fn().mockResolvedValue(true), // 필요한 메서드만 모킹
          },
        },
        {
          provide: AuthService,
          useValue: { 
            someMethod: jest.fn().mockResolvedValue(true), // 필요한 메서드만 모킹
           },
        },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();

    // Global pipes (including validation)
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        enableDebugMessages: true,
      }),
      // new ValidationPipe(),
      new PasswordCheckPipe(), // Applying the custom password check pipe globally (optional)
    );

    await app.init();

    // controller = moduleFixture.get<AuthController>(AuthController);
    userRepository = moduleFixture.get<Repository<User>>(getRepositoryToken(User));
  });

  afterAll(async () => {
    await app.close();
  });

  // beforeEach(async () => {
  //   const module: TestingModule = await Test.createTestingModule({
  //     controllers: [AuthController],
  //   }).compile();

  //   controller = module.get<AuthController>(AuthController);
  // });

  // it('should be defined', () => {
  //   expect(controller).toBeDefined();
  // });
  
  describe('signup', () => {
    let signUpDto: SignUpDto;
    let response: Response;

    beforeEach(() => {
      signUpDto = readJson(SignUpDto, './test/fixtures/auth/signUpDto.json');

      response = {
        cookie: jest.fn(),
      } as any;
    });
    
    it('should successfully create a new user', async () => {
      const createdUser = {
        email: 'test@example.com',
        nickname: 'testuser',
        password: 'testpassword',
        locale: Locale.Kr,
      } as User;
      jest.spyOn(userRepository, 'create').mockReturnValueOnce(createdUser);
      jest
        .spyOn(userRepository, 'save')
        .mockResolvedValueOnce({ ...signUpDto, id: 'userId' } as any);

      const response = await request(app.getHttpServer())
        .post('/auth/signup')
        .send(signUpDto)
        .expect(201);

      expect(response.body.user).toEqual(
        expect.objectContaining({
          email: signUpDto.email,
          nickname: signUpDto.nickname,
        }),
      );
      expect(response.body.user.password).toBeUndefined();

      // Expect the response to have set a cookie
      expect(response.headers['set-cookie']).toBeDefined();
    });

    it('[400]패스워드 확인이 일치하지 않을 때 에러(한국어일때)', async () => {
      signUpDto.passwordConfirm = 'invalid';

      const response = await request(app.getHttpServer())
        .post('/auth/signup')
        .send(signUpDto)
        .expect(400);

      expect(response.body.message).toContainEqual(
        expect.objectContaining({
          message: '패스워드가 일치하지 않습니다.',
        }),
      );
    });

    it('[폼에러] 이메일 형식이 아닐 때', async () => {
      signUpDto.email = 'hoho';

      const response = await request(app.getHttpServer())
        .post('/auth/signup')
        .send(signUpDto)
        .expect(400);

      expect(response.body.message).toContain('email must be an email');
    });

    it('[폼에러] 닉네임 2글자 이하', async () => {
      signUpDto.nickname = 'ho';

      const response = await request(app.getHttpServer())
        .post('/auth/signup')
        .send(signUpDto)
        .expect(400);

      expect(response.body.message).toContain('nickname must be longer than or equal to 3 characters');
    });

    it('[폼에러] 닉네임 16글자 이상', async () => {
      signUpDto.nickname = 'hohohohohohohoho';

      const response = await request(app.getHttpServer())
        .post('/auth/signup')
        .send(signUpDto)
        .expect(400);

      expect(response.body.message).toContain('nickname must be shorter than or equal to 15 characters');
    });

    it('[폼에러] 비밀번호 5글자 이하', async () => {
      signUpDto.password = 'happy';
      signUpDto.passwordConfirm = 'happy';

      const response = await request(app.getHttpServer())
        .post('/auth/signup')
        .send(signUpDto)
        .expect(400);

      expect(response.body.message).toContain('password must be longer than or equal to 6 characters');
    });

  });
});

