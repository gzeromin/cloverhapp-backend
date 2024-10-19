import { Book } from '@/entities/book.entity';
import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class BookService {
  constructor(
    @InjectRepository(Book)
    private bookRepository: Repository<Book>,
  ) {}
  private logger = new Logger('BookService');

  async getById(id: string) {
    try {
      return await this.bookRepository.findOneBy({ id });
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException(error);
    }
  }

  async createBook(bookDto: Book): Promise<Book> {
    try {
      const book = this.bookRepository.create(bookDto);
      return await this.bookRepository.save(book);
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException();
    }
  }
}
