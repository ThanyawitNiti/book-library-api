import { Test, TestingModule } from '@nestjs/testing';
import { BooksService } from '../books-service/books.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Book } from '../books-entities/book.entity';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('BooksService', () => {
  let service: BooksService;
  let repo: Repository<Book>;
  let dataSource: DataSource;

  const mockBook = { id: 1, title: 'Test Book', isbn: '12345', quantity: 1 };

  const mockRepo = {
    find: jest.fn(),
    findOneBy: jest.fn(),
    findOne: jest.fn(),
    findBy: jest.fn(),
    findAndCount: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    create: jest.fn(),
  };

  const mockQueryRunner = {
    connect: jest.fn(),
    startTransaction: jest.fn(),
    commitTransaction: jest.fn(),
    rollbackTransaction: jest.fn(),
    release: jest.fn(),
    manager: {
      findOne: jest.fn(),
      save: jest.fn(),
      create: jest.fn(),
    },
  };

  const mockDataSource = {
    createQueryRunner: jest.fn().mockReturnValue(mockQueryRunner),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BooksService,
        { provide: getRepositoryToken(Book), useValue: mockRepo },
        { provide: DataSource, useValue: mockDataSource },
      ],
    }).compile();

    service = module.get<BooksService>(BooksService);
    repo = module.get<Repository<Book>>(getRepositoryToken(Book));
    dataSource = module.get<DataSource>(DataSource);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return all books', async () => {
    mockRepo.find.mockResolvedValue([mockBook]);

    const result = await service.findAll();

    expect(result).toEqual([mockBook]);
    expect(mockRepo.find).toHaveBeenCalled();
  });

  it('should return one book by id', async () => {
    mockRepo.findOneBy.mockResolvedValue(mockBook);

    const result = await service.findOne(1);

    expect(result).toEqual(mockBook);
    expect(mockRepo.findOneBy).toHaveBeenCalledWith({ id: 1 });
  });

  it('should throw NotFoundException if book not found', async () => {
    mockRepo.findOneBy.mockResolvedValue(null);

    await expect(service.findOne(99)).rejects.toThrow(NotFoundException);
  });

  it('should create a new book if ISBN not exists', async () => {
    mockRepo.find.mockResolvedValue([]); // no duplicate ISBN
    mockQueryRunner.manager.create.mockReturnValue(mockBook);
    mockQueryRunner.manager.save.mockResolvedValue(mockBook);

    const dto = {
      title: 'Test Book',
      isbn: '12345',
      author: 'John Doe',
      quantity: 1,
    };

    const result = await service.create(dto, null as any);

    expect(result).toEqual(mockBook);
    expect(mockQueryRunner.manager.save).toHaveBeenCalled();
  });

  it('should throw BadRequestException if ISBN exists', async () => {
    mockRepo.find.mockResolvedValue([mockBook]);

    const dto = {
      title: 'Test Book',
      isbn: '12345',
      author: 'John Doe',
      quantity: 1,
    };

    await expect(service.create(dto, null as any)).rejects.toThrow(
      BadRequestException,
    );
  });

  it('should update book details', async () => {
    mockRepo.findOneBy.mockResolvedValue(mockBook);
    mockRepo.update.mockResolvedValue(undefined);
    mockRepo.findOneBy.mockResolvedValue({
      ...mockBook,
      title: 'Updated Book',
    });

    const result = await service.update(1, { title: 'Updated Book' });

    expect(result.title).toBe('Updated Book');
    expect(mockRepo.update).toHaveBeenCalledWith(1, { title: 'Updated Book' });
  });

  it('should borrow a book (quantity -1)', async () => {
    mockQueryRunner.manager.findOne.mockResolvedValue(mockBook);
    mockQueryRunner.manager.save.mockResolvedValue({
      ...mockBook,
      quantity: 0,
    });

    const result = await service.borrowBook(1, '12345');

    expect(result.quantity).toBe(0);
    expect(mockQueryRunner.manager.save).toHaveBeenCalled();
  });

  it('should throw BadRequestException if no copies available', async () => {
    mockQueryRunner.manager.findOne.mockResolvedValue({
      ...mockBook,
      quantity: 0,
    });

    await expect(service.borrowBook(1, '12345')).rejects.toThrow(
      BadRequestException,
    );
  });

    it('should return a book (quantity +1)', async () => {
    mockQueryRunner.manager.findOne.mockResolvedValue(mockBook);
    mockQueryRunner.manager.save.mockResolvedValue({ ...mockBook, quantity: 2 });

    const result = await service.returnBook(1, '12345');

    expect(result.quantity).toBe(2);
    expect(mockQueryRunner.manager.save).toHaveBeenCalled();
  });

});
