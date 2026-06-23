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

      const rawGenreId = req.body?.genreId;
      const genreId = (Array.isArray(rawGenreId) ? rawGenreId[0] : rawGenreId)?.trim?.();
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
