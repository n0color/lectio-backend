import type { Request, Response, NextFunction } from 'express'
import bookService from './manageBook-service';
import ApiError from '~/exceptions/api-error';
import type { CreateChapterDto } from '~/dtos/create-book-dto';

export class ManageBookController {

  async createBook(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw ApiError.UnauthorizedError();
      }
      const bookData = req.body;
      const response = await bookService.addBook(userId, bookData);
      res.status(201).json(response);
    }
    catch (error) {
      next(error);
    }
  }
  async updateBook(req: Request, res: Response, next: NextFunction) {
    try {
      const { bookId } = req.params;
      if (!bookId || typeof bookId !== 'string') {
        throw ApiError.BadRequest("Неверные данные");
      }
      const userId = req.user?.id;
      if (!userId) throw ApiError.UnauthorizedError();
      const updateData: any = req.body;
      const updatedBook = await bookService.updateBook(bookId, userId, updateData);
      res.json(updatedBook);
    } catch (error) {
      next(error);
    }
  }
  async deleteBook(req: Request, res: Response, next: NextFunction) {
    try {
      const { bookId } = req.params;
      if (!bookId || typeof bookId !== 'string') {
        throw ApiError.BadRequest("Неверные данные");
      }
      const userId = req.user?.id;
      if (!userId) throw ApiError.UnauthorizedError();
      const result = await bookService.deleteBook(bookId, userId);
      res.json(result);
    } catch (error) {
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
    const response = await bookService.addChapter(bookId, chapterData);
    res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  }
  async updateChapter(req: Request, res: Response, next: NextFunction) {
    try {
      const { chapterId } = req.params;
      if (!chapterId || typeof chapterId !== 'string') {
        throw ApiError.BadRequest("Неверные данные");
      }
      const userId = req.user?.id;
      if (!userId) throw ApiError.UnauthorizedError();
      const updateData: any = req.body;
      const updatedChapter = await bookService.updateChapter(chapterId, userId, updateData);
      res.json(updatedChapter);
    } catch (error) {
      next(error);
    }
  }
  
  async deleteChapter(req: Request, res: Response, next: NextFunction) {
    try {
      const { chapterId } = req.params;
      if (!chapterId || typeof chapterId !== 'string') {
        throw ApiError.BadRequest("Неверные данные");
      }
      const userId = req.user?.id;
      if (!userId) throw ApiError.UnauthorizedError();
      const result = await bookService.deleteChapter(chapterId, userId);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }


}
