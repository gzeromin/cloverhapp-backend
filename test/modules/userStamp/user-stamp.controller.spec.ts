import { Test, TestingModule } from '@nestjs/testing';
import { UserStampController } from '@/modules/user-stamp/user-stamp.controller';

describe('UserStampController', () => {
  let controller: UserStampController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserStampController],
    }).compile();

    controller = module.get<UserStampController>(UserStampController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
