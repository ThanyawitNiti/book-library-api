import { Module } from '@nestjs/common';
import { BooksService } from './books-service/books.service';
import { BooksController } from './books-controller/books.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Book } from './books-entities/book.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Book])],
  controllers: [BooksController],
  providers: [BooksService],
})
export class BooksModule {}
