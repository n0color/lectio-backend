import type { Request, Response, NextFunction } from 'express'
import bookService from './manageBook-service';
import ApiError from '~/exceptions/api-error';
import type { CreateChapterDto } from '~/dtos/create-book-dto';

export class ManageBookController {

  async getUserBooks(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) throw ApiError.UnauthorizedError();
      const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
      const perPage = req.query.per_page ? parseInt(req.query.per_page as string, 10) : 20;
      const result = await bookService.getUserBooks(userId, page, perPage);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
  
  async getBookById(req: Request, res: Response, next: NextFunction) {
    try {
      const { bookId } = req.params;
      if (!bookId || typeof bookId !== 'string') {
        throw ApiError.BadRequest("Неверные данные");
      }
      const book = await bookService.getBookById(bookId);
      res.json(book);
    } catch (error) {
      next(error);
    }
  }

  async getChapterById(req: Request, res: Response, next: NextFunction) {
    try {
      const { chapterId } = req.params;
      if (!chapterId || typeof chapterId !== 'string') {
        throw ApiError.BadRequest("Неверные данные");
      }
      const userId = req.user?.id;
      if (!userId) throw ApiError.UnauthorizedError();
  
      const chapter = await bookService.getChapterById(chapterId, userId);
      res.json(chapter);
    } catch (error) {
      next(error);
    }
  }

  async getGenres(_req: Request, res: Response, next: NextFunction) {
    try {
      const genres = await bookService.getGenres();
      res.json({ items: genres });
    } catch (error) {
      next(error);
    }
  }

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
      delete updateData.authorId;
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
  async uploadCover(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.file) throw ApiError.BadRequest('Нет прикреплённого файла');
      if (typeof req.params.bookId !== 'string') throw ApiError.BadRequest('Нет идентификатора книги');
      const userId = req.user?.id;
      if (!userId) throw ApiError.UnauthorizedError();
      const coverUrl = await bookService.updateCover(
        req.params.bookId,
        userId,
        req.file.buffer,
        req.file.originalname,
        req.file.mimetype
      );
      res.json({ coverUrl });
    } catch (err) {
      next(err);
    }
  }


}
