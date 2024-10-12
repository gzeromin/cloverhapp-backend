import { Book } from '@/entities/book.entity';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class BookService {
  constructor(
    @InjectRepository(Book)
    private bookRepository: Repository<Book>,
  ) {}

  async getById(id: string) {
    return await this.bookRepository.findOneBy({ id });
  }

  async createBook(bookDto: Book): Promise<Book> {
    try {
      const book = this.bookRepository.create(bookDto);
      return await this.bookRepository.save(book);
    } catch (error) {
      throw new InternalServerErrorException();
    }
  }
}
