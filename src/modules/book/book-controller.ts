// src/modules/book/book-controller.ts
import type { Request, Response, NextFunction } from 'express';
import bookService from './book-service';
import ApiError from '~/exceptions/api-error';

class BookController {
  /**
   * GET /books/:bookId
   */
  async getBookWithChapters(req: Request, res: Response, next: NextFunction) {
    try {
      const { bookId } = req.params;
      // Приводим к строке, т.к. параметр может быть массивом
      const bookIdStr = Array.isArray(bookId) ? bookId[0] : bookId;
      
      if (!bookIdStr) {
        throw ApiError.BadRequest('Не указан ID книги');
      }
      
      const result = await bookService.getBookWithChapters(bookIdStr);
      console.log(JSON.stringify(result, null, 2));
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /books/:bookId/chapters/:chapterNumber
   */
  async getChapterByNumber(req: Request, res: Response, next: NextFunction) {
    try {
      const { bookId, chapterNumber } = req.params;
      
      const bookIdStr = Array.isArray(bookId) ? bookId[0] : bookId;
      const chapterNumberStr = Array.isArray(chapterNumber) ? chapterNumber[0] : chapterNumber;
      
      if (!bookIdStr || !chapterNumberStr) {
        throw ApiError.BadRequest('Не указаны ID книги или номер главы');
      }
      
      const number = parseInt(chapterNumberStr, 10);
      if (isNaN(number)) {
        throw ApiError.BadRequest('Номер главы должен быть числом');
      }
      
      const result = await bookService.getChapterByNumber(bookIdStr, number);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }
}

export default new BookController();