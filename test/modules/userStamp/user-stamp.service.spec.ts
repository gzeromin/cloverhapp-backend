import { Test, TestingModule } from '@nestjs/testing';
import { UserStampService } from '@/modules/user-stamp/user-stamp.service';

describe('UserStampService', () => {
  let service: UserStampService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UserStampService],
    }).compile();

    service = module.get<UserStampService>(UserStampService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
