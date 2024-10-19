import { Controller, Get, Logger, Param, Post } from '@nestjs/common';
import { BookService } from './book.service';
import { Book } from '@/entities/book.entity';
import { ApiBody, ApiOperation, ApiResponse } from '@nestjs/swagger';

@Controller('book')
export class BookController {
  constructor(private bookService: BookService) {}
  private logger = new Logger('BookController');

  @ApiOperation({
    summary: '책 정보 반환',
    description: `
      책 정보 반환
    `,
  })
  @ApiResponse({
    status: 200,
    description: '책 정보 반환 성공',
    type: [Book],
  })
  @ApiResponse({
    status: 500,
    description: '시스템 에러 발생',
  })
  @Get('/:id')
  getById(@Param('id') id: string): Promise<Book> {
    return this.bookService.getById(id);
  }

  @ApiOperation({
    summary: '책 생성',
    description: `
      책 생성을 처리하는 API입니다. 
      입력된 정보가 유효하면 새로운 책이 생성됩니다.
    `,
  })
  @ApiBody({
    description: '책 생성에 필요한 정보',
    type: Book,
  })
  @ApiResponse({
    status: 201,
    description: '유저 생성 성공',
    type: Book,
  })
  @ApiResponse({
    status: 400,
    description: '폼 에러 발생',
  })
  @ApiResponse({
    status: 500,
    description: '시스템 에러 발생',
  })
  @Post('')
  createBook(bookDto: Book): Promise<Book> {
    return this.bookService.createBook(bookDto);
  }
}
