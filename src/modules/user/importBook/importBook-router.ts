import { Router } from 'express';
import authMiddleware from '~/middleware/auth-middleware';
import importBookController from './importBook-controller';
import multer from 'multer';
import type { Request, Response, NextFunction } from 'express';
import ApiError from '~/exceptions/api-error';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 200 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const name = file.originalname.toLowerCase();
    const mime = file.mimetype.toLowerCase();
    const isFb2 =
      name.endsWith('.fb2') ||
      mime === 'application/x-fictionbook' ||
      mime === 'application/x-fictionbook+xml' ||
      mime === 'text/xml' ||
      mime === 'application/xml' ||
      mime === 'application/octet-stream';

    if (isFb2) {
      cb(null, true);
    } else {
      cb(new Error('Поддерживаются только файлы FB2'));
    }
  },
});

function handleUpload(req: Request, res: Response, next: NextFunction) {
  upload.single('file')(req, res, (err) => {
    if (!err) {
      return next();
    }
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return next(ApiError.BadRequest('Файл слишком большой (максимум 200 МБ)'));
      }
      if (err.code === 'LIMIT_UNEXPECTED_FILE') {
        return next(ApiError.BadRequest('Поле файла должно называться "file"'));
      }
      return next(ApiError.BadRequest('Ошибка загрузки файла'));
    }
    return next(ApiError.BadRequest(err.message || 'Ошибка загрузки файла'));
  });
}

export const importBookRouter = Router();

importBookRouter.post(
  '/fb2',
  authMiddleware,
  handleUpload,
  (req, res, next) => {
    importBookController.importBook(req, res, next).catch(next);
  },
);
