import { AppModule } from '@/app.module';
import { AuthController } from '@/modules/auth/auth.controller';
import { SignUpDto } from '@/modules/auth/dto/sign-up.dto';
import { PasswordCheckPipe } from '@/modules/auth/pipe/password-check.pipe';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { readJson } from '../../utils/readJson';

describe('AuthController (e2e)', () => {
  let app: INestApplication;
  let controller: AuthController;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule], // Root app module containing the AuthModule
    }).compile();

    app = moduleFixture.createNestApplication();

    // Global pipes (including validation)
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
      new PasswordCheckPipe(), // Applying the custom password check pipe globally (optional)
    );

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('signup', () => {
    let signUpDto: SignUpDto;

    beforeEach(() => {
      signUpDto = readJson(SignUpDto, './test/fixtures/auth/signUpDto.json');
    });
    it('should successfully create a new user', async () => {
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

    it('[400]패스워드 확인이 일치하지 않을 때 에러', async () => {
      signUpDto.passwordConfirm = 'invalid';

      const response = await request(app.getHttpServer())
        .post('/auth/signup')
        .send(signUpDto)
        .expect(400);

      expect(response.body.message).toContain('Invalid password');
    });

    // it('[폼에러] 이메일 형식이 아닐 때', async () => {});
  });
});
