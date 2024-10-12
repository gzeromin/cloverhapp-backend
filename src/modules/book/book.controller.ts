import { Controller, Get, Logger, Param, Post } from '@nestjs/common';
import { BookService } from './book.service';
import { Book } from '@/entities/book.entity';

@Controller('book')
export class BookController {
  constructor(private bookService: BookService) {}
  private logger = new Logger('BookController');

  @Get('/:id')
  getById(@Param('id') id: string): Promise<Book> {
    return this.bookService.getById(id);
  }
  @Post('')
  createBook(bookDto: Book): Promise<Book> {
    return this.bookService.createBook(bookDto);
  }
}
