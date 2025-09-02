import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, ILike, Repository } from 'typeorm';
import { Book } from '../books-entities/book.entity';
import { CreateBookDto, UpdateBookDto } from '../books-dto/bookDto.dto';
import type * as multer from 'multer';
@Injectable()
export class BooksService {
  constructor(
    @InjectRepository(Book)
    private readonly bookRepo: Repository<Book>,
    private readonly dataSource: DataSource,
  ) {}

  async create(dto: CreateBookDto, file: multer.File): Promise<Book> {
    // เริ่ม transaction
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      // หาชื่อของหนังสือหากพบให้เพิ่มจำนวน
      const foundBooks = await this.findByTitle(dto.title);
      console.log(foundBooks,'foundBooks')
      if (foundBooks.length > 0) {
        //เพิ่มจำนวนหนังสือ
        foundBooks[0].quantity += 1;
        const updateTotal = await queryRunner.manager.save(foundBooks[0]);
        await queryRunner.commitTransaction();
        return updateTotal;
      } else {
        //  หากไม่พบให้ สร้างใหม่
        const book = queryRunner.manager.create(Book, {
          ...dto,
          quantity: dto.quantity ?? 1,
          coverImage: file ? `/uploads/${file.filename}` : undefined,
        });
        const newBook = await queryRunner.manager.save(book);
        await queryRunner.commitTransaction();
        return newBook;
      }
    } catch {
      await queryRunner.rollbackTransaction();
      throw new Error('Failed to create book');
    } finally {
      await queryRunner.release();
    }
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

  async findByTitle(title: string): Promise<Book[]> {
    return this.bookRepo.find({ where: { title } });
  }

  async searchBook(title: string): Promise<Book[]> {
    console.log('searchBook -> title:', title);
    return this.bookRepo.find({
      where: { title: ILike(`%${title}%`) },
    });
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
