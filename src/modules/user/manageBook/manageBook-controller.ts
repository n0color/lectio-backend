import type { Request, Response, NextFunction } from 'express'
import bookService from './manageBook-service';
import ApiError from '~/exceptions/api-error';
import type { CreateChapterDto } from '~/dtos/create-book-dto';

export class ManageBookController {

  async createBook(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw ApiError.BadRequest("Неверные данные");
      }
      const bookData = req.body;

      const book = await bookService.createBook(userId, bookData);

      return res.json({
        data: book,
        message: `Вы успешно создали книгу ${book.title}`,
      })
    }
    catch (error) {
      next(error);
    }
  }
  async createChapter(req: Request, res: Response, next: NextFunction) {
    try {
      const { bookId } = req.params;
    if (!bookId || typeof bookId !== 'string') {
      throw ApiError.BadRequest("Неверные данные");
    }
    const chapterData: CreateChapterDto = req.body;
    const chapterResult = await bookService.addChapter(bookId, chapterData);
    res.status(201).json(chapterResult);
    } catch (error) {
      next(error);
    }

  }


}
