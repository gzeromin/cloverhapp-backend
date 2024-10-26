import { Book } from '@/entities/book.entity';
import { BookService } from '@/modules/book/book.service';
import { InternalServerErrorException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

describe('BookService', () => {
  let service: BookService;
  let bookRepository: Repository<Book>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BookService,
        {
          provide: getRepositoryToken(Book), // BookRepository의 mock 제공
          useClass: Repository, // 또는 필요한 경우 다른 mock 클래스를 제공
        },
      ],
    }).compile();

    service = module.get<BookService>(BookService);
    bookRepository = module.get<Repository<Book>>(getRepositoryToken(Book));
  });

  describe('getById', () => {
    it('성공케이스', async () => {
      // Given
      const bookId = '26137ac8-220c-47d3-aa5e-4c68d4eccd80';
      const findBook = { id: bookId } as Book; // Mock된 응답
      // Dto
      // When
      // Mock
      jest.spyOn(bookRepository, 'findOneBy').mockResolvedValue(findBook);
      // getById(id)
      const result = await service.getById(bookId);
      // Then
      // Book
      // 결과 확인
      expect(result).toEqual(
        expect.objectContaining({
          id: bookId,
        }),
      );
    });

    it('실패케이스(시스템에러발생)', async () => {
      // Given
      const bookId = 'invalid-id';
      // Dto
      // mockup -> findOneBy error
      jest.spyOn(bookRepository, 'findOneBy').mockImplementation(() => {
        throw new Error('Database error');
      });
      // When
      // getById(id)
      const result = service.getById(bookId);
      // Then
      // 500
      await expect(result).rejects.toThrow(InternalServerErrorException);
    });
  });
});
