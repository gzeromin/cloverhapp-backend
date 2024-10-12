import { Test, TestingModule } from '@nestjs/testing';
import { HappController } from '../../../../src/modules/happ/happ.controller';

describe('HappController', () => {
  let controller: HappController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HappController],
    }).compile();

    controller = module.get<HappController>(HappController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
