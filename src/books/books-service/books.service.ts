import {
  BadRequestException,
  HttpException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
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
      // // หาชื่อของหนังสือหากพบให้เพิ่มจำนวน
      const foundBooks = await this.findByIsbn(dto.isbn);
      if (foundBooks.length > 0) {
        throw new BadRequestException('ISBN already exists');
      }
      // console.log(foundBooks, 'foundBooks');
      // if (foundBooks.length > 0) {
      //   //เพิ่มจำนวนหนังสือ
      //   foundBooks[0].quantity += 1;
      //   const updateTotal = await queryRunner.manager.save(foundBooks[0]);
      //   await queryRunner.commitTransaction();
      //   return updateTotal;
      // } else {
      //  หากไม่พบให้ สร้างใหม่
      const book = queryRunner.manager.create(Book, {
        ...dto,
        // quantity: dto.quantity ?? 1,
        // cover_image: file ? `/uploads/${file.filename}` : undefined,
        cover_image: file
          ? `http://localhost:8080/uploads/${file.filename}`
          : undefined,
      });
      const newBook = await queryRunner.manager.save(book);
      await queryRunner.commitTransaction();
      return newBook;
      // }
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
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

  // async update(id: number, dto: UpdateBookDto): Promise<Book> {
  //   await this.findOne(id);
  //   await this.bookRepo.update(id, dto);
  //   return this.findOne(id);
  // }
  async update(
    id: number,
    dto: UpdateBookDto,
    file?: multer.File,
  ): Promise<Book> {
    try {
      const book = await this.findOne(id);
      if (!book) {
        throw new BadRequestException('Book not found');
      }

      // ถ้ามีไฟล์ใหม่ → set ค่า cover_image ใหม่
      if (file) {
        dto.cover_image = `http://localhost:8080/uploads/${file.filename}`;
      }

      await this.bookRepo.update(id, dto);
      return this.findOne(id);
    } catch (error) {
      throw error;
    }
  }

  async remove(id: number): Promise<void> {
    await this.findOne(id);
    await this.bookRepo.delete(id);
  }

  async findByTitle(title: string): Promise<Book[]> {
    return this.bookRepo.find({ where: { title } });
  }

  async findByIsbn(isbn: string): Promise<Book[]> {
    return this.bookRepo.find({ where: { isbn } });
  }

  async searchBook(title: string): Promise<Book[]> {
    console.log('searchBook -> title:', title);
    return this.bookRepo.find({
      where: { title: ILike(`%${title}%`) },
    });
  }

  async borrowBook(id: number, isbn: string): Promise<Book> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // lock แถวนี้ไว้จนจบ transaction
      const book = await queryRunner.manager.findOne(Book, {
        where: { id, isbn },
        lock: { mode: 'pessimistic_write' },
      });

      if (!book) {
        throw new NotFoundException('Book not found');
      }
      if (book.quantity <= 0) {
        throw new BadRequestException('No copies available');
      }

      book.quantity -= 1;
      const savedBook = await queryRunner.manager.save(book);

      //  commit เมื่อทุกอย่างสำเร็จ
      await queryRunner.commitTransaction();
      return savedBook;
    } catch (error) {
      // rollback ถ้าเจอ error
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      // ปิด connection
      await queryRunner.release();
    }
  }

  async returnBook(id: number, isbn: string): Promise<Book> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // lock แถวนี้ไว้จนจบ transaction
      const book = await queryRunner.manager.findOne(Book, {
        where: { id, isbn },
        lock: { mode: 'pessimistic_write' },
      });

      if (!book) {
        throw new BadRequestException('Book not found');
      }

      book.quantity += 1;
      const savedBook = await queryRunner.manager.save(book);
      //  commit เมื่อทุกอย่างสำเร็จ
      await queryRunner.commitTransaction();
      return savedBook;
    } catch (error) {
      // rollback ถ้าเจอ error
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      // ปิด connection
      await queryRunner.release();
    }
  }
}
