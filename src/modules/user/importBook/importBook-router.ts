import { Router } from 'express';
import authMiddleware from '~/middleware/auth-middleware';
import importBookController from './importBook-controller';
import multer from 'multer';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 25 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/x-fictionbook' || file.originalname.endsWith('.fb2')) {
      cb(null, true);
    } else {
      cb(new Error('Неподдерживаемый тип файла'));
    }
  }
})

export const importBookRouter = Router();

importBookRouter.post('/fb2', authMiddleware, upload.single('file'), importBookController.importBook);

