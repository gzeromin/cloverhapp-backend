import { Book } from '@/entities/book.entity';
import { BookService } from '@/modules/book/book.service';
import { InternalServerErrorException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { readJson } from 'test/utils/readJson';
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

  afterEach(() => {
    jest.clearAllMocks();
  });

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

  describe('createBook', () => {
    let bookDto: Book;
    let response: Response;
    let createdbook: Book;

    beforeEach(() => {
      bookDto = {
        title: "미움받을 용기",
        contents: "인간은 변할 수 있고, 누구나 행복해 질 수 있다. 단 그러기 위해서는 ‘용기’가 필요하다고 말한 철학자가 있다. 바로 프로이트, 융과 함께 ‘심리학의 3대 거장’으로 일컬어지고 있는 알프레드 아들러다. 『미움받을 용기』는 아들러 심리학에 관한 일본의 1인자 철학자 기시미 이치로와 베스트셀러 작가인 고가 후미타케의 저서로, 아들러의 심리학을 ‘대화체’로 쉽고 맛깔나게 정리하고 있다. 아들러 심리학을 공부한 철학자와 세상에 부정적이고 열등감 많은",
        url: "https://search.daum.net/search?w=bookpage&bookId=1467038&q=%EB%AF%B8%EC%9B%80%EB%B0%9B%EC%9D%84+%EC%9A%A9%EA%B8%B0",
        isbn: "8996991341 9788996991342",
        thumbnail: "https://search1.kakaocdn.net/thumb/R120x174.q85/?fname=http%3A%2F%2Ft1.daumcdn.net%2Flbook%2Fimage%2F1467038",
        publisher: "인플루엔셜",
        authors: [
          "기시미 이치로",
          "고가 후미타케"
        ]
      } as Book; /* Book DTO 초기화 */

      response = {
        cookie: jest.fn(),
      } as any;
    });
    it('성공케이스', async () => {
      // Given
      createdbook = {
        title: "미움받을 용기",
        contents: "인간은 변할 수 있고, 누구나 행복해 질 수 있다. 단 그러기 위해서는 ‘용기’가 필요하다고 말한 철학자가 있다. 바로 프로이트, 융과 함께 ‘심리학의 3대 거장’으로 일컬어지고 있는 알프레드 아들러다. 『미움받을 용기』는 아들러 심리학에 관한 일본의 1인자 철학자 기시미 이치로와 베스트셀러 작가인 고가 후미타케의 저서로, 아들러의 심리학을 ‘대화체’로 쉽고 맛깔나게 정리하고 있다. 아들러 심리학을 공부한 철학자와 세상에 부정적이고 열등감 많은",
        url: "https://search.daum.net/search?w=bookpage&bookId=1467038&q=%EB%AF%B8%EC%9B%80%EB%B0%9B%EC%9D%84+%EC%9A%A9%EA%B8%B0",
        isbn: "8996991341 9788996991342",
        thumbnail: "https://search1.kakaocdn.net/thumb/R120x174.q85/?fname=http%3A%2F%2Ft1.daumcdn.net%2Flbook%2Fimage%2F1467038",
        publisher: "인플루엔셜",
        authors: [
          "기시미 이치로",
          "고가 후미타케"
        ]
      } as Book;
      // Mock
      jest.spyOn(bookRepository, 'create').mockReturnValueOnce(createdbook);
      jest
        .spyOn(bookRepository, 'save')
        .mockResolvedValueOnce({ ...bookDto, id: 'bookId' } as any);
      // createBook(bookDto)
      const result = await service.createBook(bookDto);
      // 결과 확인
      expect(result).toEqual(
        expect.objectContaining({
          title: createdbook.title,
          contents: createdbook.contents,
          url: createdbook.url,
          isbn: createdbook.isbn,
          thumbnail: createdbook.thumbnail,
          publisher: createdbook.publisher,
          authors: createdbook.authors,
        }),
      )
    });

    it('실패케이스(시스템에러발생)', async () => {
      const bookDto = {
        title: "사랑하는 사람과 나누는 대화",
      } as Book; /* Book DTO 초기화 */
      // mockup -> save error
      jest.spyOn(bookRepository, 'create').mockReturnValueOnce(bookDto);
      jest.spyOn(bookRepository, 'save').mockImplementation(() => {
        throw new Error('Database error');
      });

      // createBook(bookDto)
      const result = service.createBook(bookDto);
      // Then
      // 500
      await expect(result).rejects.toThrow(InternalServerErrorException);
    });
  });
});
