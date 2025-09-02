import { PartialType } from '@nestjs/mapped-types';
import { IsNotEmpty, IsOptional, IsNumber } from 'class-validator';

export class CreateBookDto {
  @IsNotEmpty()
  title: string;

  @IsNotEmpty()
  author: string;

  @IsNotEmpty()
  isbn: string;

  @IsOptional()
  @IsNumber()
  publication_year?: number;

  @IsOptional()
  coverImage?: string;

  @IsNumber()
  quantity: number;
}

export class UpdateBookDto extends PartialType(CreateBookDto) {}
