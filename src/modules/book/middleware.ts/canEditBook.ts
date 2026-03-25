import type { Request, Response, NextFunction } from 'express';
import { prisma } from '~/lib/prisma';
import ApiError from '~/exceptions/api-error';

export async function canEditBook(req: Request, res: Response, next: NextFunction) {
  try {
    const bookId = req.params.bookId;
    const userId = req.user?.id;

    if (!bookId || typeof bookId !== 'string') {
      return next(ApiError.BadRequest("Нет идентификатора книги"));
    }
    if (!userId) {
      return next(ApiError.UnauthorizedError());
    }

    const book = await prisma.book.findUnique({
      where: { id: bookId },
      select: { authorId: true, coAuthorId: true }
    });

    if (!book) {
      return next(ApiError.NotFound('Книга не найдена'));
    }

    if (book.authorId === userId || book.coAuthorId === userId) {
      return next();
    }

    return next(ApiError.Forbidden('Нет прав на редактирование этой книги'));
  } catch (error) {
    next(error);
  }
}