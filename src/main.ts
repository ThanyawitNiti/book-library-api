import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { join } from 'path';
import { NestExpressApplication } from '@nestjs/platform-express';

async function bootstrap() {
   const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // เปิด CORS ให้ frontend เข้าถึงได้
  app.enableCors({
    origin: 'http://localhost:3000', // frontend
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  //ให้โฟลเดอร์ uploads ถูก serve แบบ static
  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/uploads/',
  });

  // set global prefix
  app.setGlobalPrefix('api/v1');
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
