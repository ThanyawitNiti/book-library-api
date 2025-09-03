import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Book {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar' })
  title: string;

  @Column()
  author: string;

  @Column({ type: 'varchar', unique: true })
  isbn: string;

  @Column({ nullable: true })
  publication_year: number;

  @Column({ nullable: true })
  coverImage: string;

  @Column({ default: 1 })
  quantity: number;
}
