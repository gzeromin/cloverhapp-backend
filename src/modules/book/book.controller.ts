import { Controller, Get, Param, Post } from '@nestjs/common';
import { BookService } from './book.service';
import { Book } from '@/entities/book.entity';
import { ApiResponse } from '@nestjs/swagger';

@Controller('book')
export class BookController {
  constructor(private bookService: BookService) {}

  @ApiResponse({
    status: 200,
    description: '',
    type: Book,
  })
  @ApiResponse({
    status: 500,
    description: '시스템 에러 발생',
  })
  @Get('/:id')
  getById(@Param('id') id: string): Promise<Book> {
    return this.bookService.getById(id);
  }

  @ApiResponse({
    status: 201,
    description: '',
    type: Book,
  })
  @ApiResponse({
    status: 500,
    description: '시스템 에러 발생',
  })
  @Post()
  createBook(bookDto: Book): Promise<Book> {
    return this.bookService.createBook(bookDto);
  }
}
