import { BookService } from '@/modules/book/book.service';
import { Test, TestingModule } from '@nestjs/testing';

describe('BookService', () => {
  let service: BookService;
  let bookRepository: Repository<Book>;
  let bookDto: Book;
  let response: Response;
  let foundBook: Book;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BookService],
    }).compile();

    service = module.get<BookService>(BookService);
    bookRepository = module.get<Repository<Book>>(getRepositoryToken(Book));  // getRepositoryToken을 통해 mock된 Repository 가져오기
  });

  it('성공적으로 책 정보를 반환하는 케이스', async () => {
    // Given: mock data 설정
    foundBook = {
      id: '26137ac8-220c-47d3-aa5e-4c68d4eccd80',
    } as Book;

    // bookRepository.findOne을 mock 처리하여 데이터를 반환하도록 설정
    jest.spyOn(bookRepository, 'findBy').mockResolvedValueOnce([foundBook]);

    // when: getById 호출
    const result = await service.getById('26137ac8-220c-47d3-aa5e-4c68d4eccd80');

    // then: 결과 검증
    expect(result).toEqual(
      expect.objectContaining({
        id: '26137ac8-220c-47d3-aa5e-4c68d4eccd80',
        title: 'Sample Book',
        contents: 'This is a sample content',
      }),
    );
  });

  it('해당 ID의 책을 찾을 수 없는 경우 null 반환', async () => {
    // Given: 책이 없을 때의 상황 설정
    jest.spyOn(bookRepository, 'findOne').mockResolvedValueOnce(null);

    // when: getById 호출 (존재하지 않는 ID로)
    const result = await service.getById('non-existing-id');

    // then: 결과가 null이어야 함을 확인
    expect(result).toBeNull();
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
