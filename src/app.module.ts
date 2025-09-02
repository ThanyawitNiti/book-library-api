import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { BooksModule } from './books/books.module';
import { DatabaseModule } from './database/database.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // ทำให้ ConfigService ใช้ได้ทุกที่
      envFilePath: '.env', // ระบุ path ของไฟล์ .env (default = root project)
    }),
    DatabaseModule,
    AuthModule,
    BooksModule,
    
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
