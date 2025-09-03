import { Test, TestingModule } from '@nestjs/testing';
import { BooksController } from '../books-controller/books.controller';
import { BooksService } from '../books-service/books.service';

/* 
ใช้บอก Jest ว่าเวลาเจอ import { AuthGuard } ให้แทนด้วย mock
*/
jest.mock('../../auth/auth.guard', () => ({
  // สร้างฟังก์ชัน mock ที่ ไม่ทำอะไรเลย และ return true
  AuthGuard: jest.fn().mockImplementation(() => true),
}));

// กลุ่ม test case ของ BooksController
describe('BooksController', () => {
  // ตัวแปรเก็บ instance ของ controller , service (ที่จะสร้างขึ้นมาใหม่ในแต่ละรอบ)
  let controller: BooksController;
  let service: BooksService;

  // object ที่มี method เหมือน BooksService จริงทุกตัว
  const mockBooksService = {
    create: jest.fn(),
    borrowBook: jest.fn(),
    returnBook: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    searchBook: jest.fn(),
    update: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BooksController],
      providers: [
        {
          provide: BooksService,
          // ใช้ mockBooksService แทนที่ BooksService จริง
          useValue: mockBooksService,
        },
      ],
    }).compile();

    // ดึง instance ของ controller และ service ออกมาใช้งาน
    controller = module.get<BooksController>(BooksController);
    service = module.get<BooksService>(BooksService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should create a book', async () => {
    const dto = {
      title: 'Test',
      author: 'John Doe',
      isbn: '1234567890123',
      quantity: 1,
    };
    const file = { filename: 'cover.png' } as any;

    mockBooksService.create.mockResolvedValue({
      id: 1,
      ...dto,
      cover_image: file.filename,
    });
    // เรียกใช้ controller.create จริงๆ
    const result = await controller.create(dto, file);

    expect(service.create).toHaveBeenCalledWith(dto, file);
    expect(result).toEqual({ id: 1, ...dto, cover_image: 'cover.png' });
  });

  it('should borrow a book', async () => {
    const book = { id: 1, title: 'Test', quantity: 0 };
    mockBooksService.borrowBook.mockResolvedValue(book);

    const result = await controller.borrowBook('1', '12345');

    expect(service.borrowBook).toHaveBeenCalledWith(1, '12345');
    expect(result).toEqual(book);
  });

  it('should return a book', async () => {
    const book = { id: 1, title: 'Test', quantity: 1 };
    mockBooksService.returnBook.mockResolvedValue(book);

    const result = await controller.returnBook('1', '12345');

    expect(service.returnBook).toHaveBeenCalledWith(1, '12345');
    expect(result).toEqual(book);
  });

  it('should search books by title', async () => {
    const books = [{ id: 1, title: 'NestJS Guide' }];
    mockBooksService.searchBook.mockResolvedValue(books);

    const result = await controller.search('NestJS');

    expect(service.searchBook).toHaveBeenCalledWith('NestJS');
    expect(result).toEqual(books);
  });

  it('should update a book', async () => {
    const dto = { title: 'Updated' };
    const file = { filename: 'new-cover.png' } as any;
    const updatedBook = { id: 1, ...dto, cover_image: file.filename };

    mockBooksService.update.mockResolvedValue(updatedBook);

    const result = await controller.update('1', dto, file);

    expect(service.update).toHaveBeenCalledWith(1, dto, file);
    expect(result).toEqual(updatedBook);
  });
});
