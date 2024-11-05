import { Test, TestingModule } from '@nestjs/testing';
import { BookController } from '@/modules/book/book.controller';
import { BookService } from '@/modules/book/book.service';
import { Book } from '@/entities/book.entity';

describe('BookController', () => {
  let bookController: BookController;
  let bookService: BookService;

  const mockBookService = {
    getById: jest.fn(),
    createBook: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BookController],
      providers: [
        {
          provide: BookService,
          useValue: mockBookService,
        },
      ],
    }).compile();

    bookController = module.get<BookController>(BookController);
    bookService = module.get<BookService>(BookService);
  });

  describe('getById', () => {
    it('성공케이스', async () => {
      // Given
      const bookId = '26137ac8-220c-47d3-aa5e-4c68d4eccd80';
      const expectedBook = new Book(); // Adjust with actual book data
      // mockup
      mockBookService.getById.mockResolvedValue(expectedBook);

      const result = await bookController.getById(bookId);
      expect(result).toEqual(expectedBook);
      expect(bookService.getById).toHaveBeenCalledWith(bookId);
    });

    it('실패케이스(시스템에러발생)', async () => {
      // Given
      const bookId = '26137ac8-220c-47d3-aa5e-4c68d4eccd80';
      // mockup
      mockBookService.getById.mockRejectedValue(new Error('Service Error'));

      await expect(bookController.getById(bookId)).rejects.toThrow('Service Error');
    });
  });

  describe('createBook', () => {
    it('성공케이스', async () => {
      // Given
      // Dto
      const bookDto: Book = new Book(); // Populate with necessary fields
      const expectedBook = new Book(); // Adjust with actual book data
      // mockup
      mockBookService.createBook.mockResolvedValue(expectedBook);

      const result = await bookController.createBook(bookDto);
      expect(result).toEqual(expectedBook);
      expect(bookService.createBook).toHaveBeenCalledWith(bookDto);
    });

    it('실패케이스(시스템에러발생)', async () => {
      const bookDto: Book = new Book(); // Populate with necessary fields
      // mockup
      mockBookService.createBook.mockRejectedValue(new Error('Service Error'));

      await expect(bookController.createBook(bookDto)).rejects.toThrow('Service Error');
    });
  });
});
