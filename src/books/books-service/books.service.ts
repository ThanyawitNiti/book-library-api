import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Book } from '../books-entities/book.entity';
import { CreateBookDto, UpdateBookDto } from '../books-dto/bookDto.dto';
import type * as multer from 'multer';
@Injectable()
export class BooksService {
  constructor(
    @InjectRepository(Book)
    private readonly bookRepo: Repository<Book>,
  ) {}

  async create(dto: CreateBookDto,file: multer.File): Promise<Book> {
    const book = this.bookRepo.create(dto);
    if (file) {
      book.coverImage = file.filename;
    }
    return this.bookRepo.save(book);
  }

  async findAll(): Promise<Book[]> {
    return this.bookRepo.find();
  }

  async findOne(id: number): Promise<Book> {
    const book = await this.bookRepo.findOneBy({ id });
    if (!book) throw new NotFoundException('Book not found');
    return book;
  }

  async update(id: number, dto: UpdateBookDto): Promise<Book> {
    await this.findOne(id);
    await this.bookRepo.update(id, dto);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.findOne(id);
    await this.bookRepo.delete(id);
  }

  async findByIsbn(isbn: string): Promise<Book[]> {
    return this.bookRepo.find({ where: { isbn } });
  }
  // async borrow(id: number): Promise<Book> {
  //   const book = await this.findOne(id);
  //   if (book.quantity <= 0) throw new Error('No available copies');
  //   book.quantity -= 1;
  //   return this.bookRepo.save(book);
  // }

  // async returnBook(id: number): Promise<Book> {
  //   const book = await this.findOne(id);
  //   book.quantity += 1;
  //   return this.bookRepo.save(book);
  // }
}
