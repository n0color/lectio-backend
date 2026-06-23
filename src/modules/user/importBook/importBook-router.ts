import { Router } from 'express';
import authMiddleware from '~/middleware/auth-middleware';
import importBookController from './importBook-controller';
import multer from 'multer';



const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 200 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.originalname.endsWith('.fb2')) {
      cb(null, true);
    } else {
      cb(new Error('Неподдерживаемый тип файла'));
    }
  }
})

export const importBookRouter = Router();
