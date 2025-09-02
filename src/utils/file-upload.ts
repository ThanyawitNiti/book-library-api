import { diskStorage } from 'multer';
import { extname } from 'path';

export const fileStorage = {
  storage: diskStorage({
    destination: './uploads',
    filename: (req, file, callback) => {
      // ทำ timestamp กับสุ่มเลขเพื่อป้องกันชื่อซ้ำ
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      // คืนค่านามสกุลไฟล์
      const ext = extname(file.originalname);
      // ฟังก์ชันที่ใช้ "ส่งกลับ" ชื่อไฟล์ใหม่ให้ Multer เอาไปใช้ตอนบันทึกไฟล์
      callback(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
    },
  }),
};
