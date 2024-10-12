import { Test, TestingModule } from '@nestjs/testing';
import { HappService } from '../../../../src/modules/happ/happ.service';

describe('HappService', () => {
  let service: HappService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [HappService],
    }).compile();

    service = module.get<HappService>(HappService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
