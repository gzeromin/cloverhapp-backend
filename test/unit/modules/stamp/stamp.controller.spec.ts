import { Test, TestingModule } from '@nestjs/testing';
import { StampController } from '@/modules/stamp/stamp.controller';

describe('StampController', () => {
  let controller: StampController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [StampController],
    }).compile();

    controller = module.get<StampController>(StampController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
