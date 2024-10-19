import { BookService } from '@/modules/book/book.service';
import { Test, TestingModule } from '@nestjs/testing';

describe('BookService', () => {
  let service: BookService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BookService],
    }).compile();

    service = module.get<BookService>(BookService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getById', () => {
    it('성공케이스', () => {
      // Given
      // Dto
      // When
      // getById(id)
      // Then
      // Book
    });

    it('실패케이스(시스템에러발생)', () => {
      // Given
      // Dto
      // mockup -> findOneBy error
      // When
      // getById(id)
      // Then
      // 500
    });
  });
});
