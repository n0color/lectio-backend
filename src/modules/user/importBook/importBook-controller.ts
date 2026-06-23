import type { Request, Response, NextFunction } from 'express';
import importBookService from './importBook-service';
import ApiError from '~/exceptions/api-error';

class ImportBookController {
  async importBook(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw ApiError.UnauthorizedError();
      }
      
      const file = req.file;
      if (!file) {
        throw ApiError.BadRequest('Файл не загружен');
      }
      
      // Проверка MIME типа (optional)
      if (file.mimetype !== 'application/x-fictionbook' && !file.originalname.endsWith('.fb2')) {
        throw ApiError.BadRequest('Поддерживаются только файлы FB2');
      }

      const genreId = req.body?.genreId;

      if (!genreId || typeof genreId !== 'string') {
        throw ApiError.BadRequest('Жанр обязателен');
      }

      const response = await importBookService.importFB2(file.buffer, userId, genreId);
      
      res.json(response);
    } catch (error) {
      next(error);
    }
  }
}

export default new ImportBookController();