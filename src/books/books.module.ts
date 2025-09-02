import { Module } from '@nestjs/common';
import { BooksService } from './books-service/books.service';
import { BooksController } from './books-controller/books.controller';

@Module({
  controllers: [BooksController],
  providers: [BooksService],
})
export class BooksModule {}
