import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Query,
} from '@nestjs/common';
import { BooksService } from '../books-service/books.service';
import { CreateBookDto, UpdateBookDto } from '../books-dto/bookDto.dto';
import { AuthGuard } from 'src/auth/auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import type * as multer from 'multer';
import { fileStorage } from 'src/utils/file-upload';

@Controller('books')
@UseGuards(AuthGuard)
export class BooksController {
  constructor(private readonly booksService: BooksService) {}

  @Post()
  @UseInterceptors(FileInterceptor('cover_image', fileStorage))
  create(
    @Body() createBookDto: CreateBookDto,
    @UploadedFile() file: multer.File,
  ) {
    console.log(createBookDto);
    return this.booksService.create(createBookDto, file);
  }

  @Post('borrow/:id/:isbn')
  borrowBook(@Param('id') id: string, @Param('isbn') isbn: string) {
    return this.booksService.borrowBook(+id, isbn);
  }

  @Post('return/:id/:isbn')
  returnBook(@Param('id') id: string, @Param('isbn') isbn: string) {
    return this.booksService.returnBook(+id, isbn);
  }

  @Get()
  findAll() {
    return this.booksService.findAll();
  }

  @Get('search')
  search(@Query('title') title: string) {
    console.log(title, 'This is title');
    return this.booksService.searchBook(title);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.booksService.findOne(+id);
  }

  

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateBookDto: UpdateBookDto) {
    return this.booksService.update(+id, updateBookDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.booksService.remove(+id);
  }
}
