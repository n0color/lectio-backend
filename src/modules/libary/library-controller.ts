import type { Request, Response, NextFunction } from 'express';
import libraryService from './library-service';
import { BookStatus } from '../../../generated/prisma/enums';
import { prisma } from '~/lib/prisma';

export class LibraryController {
  async getUserBooks(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id; 
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { status, page = 1, limit = 20 } = req.query;

      const filters: any = {
        page: parseInt(page as string, 10),
        limit: parseInt(limit as string, 10),
      };

      if (status && Object.values(BookStatus).includes(status as BookStatus)) {
        filters.status = status as BookStatus;
      }

      const [books, total] = await libraryService.getUserBooks(userId, filters);

      return res.json({
        data: books,
        meta: {
          page: filters.page,
          limit: filters.limit,
          total,
          totalPages: Math.ceil(total / filters.limit),
        },
      });
    } catch (error) {
      console.log(error);
      next(error);
    }
  }

  async getUserBook(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { bookId } = req.params;
      if (!bookId || typeof bookId !== 'string') {
        return res.status(400).json({ error: 'Invalid bookId' });
      }

      const entry = await libraryService.getUserBook(userId, bookId);
      if (!entry) {
        return res.status(404).json({ error: 'Book not found in user library' });
      }

      return res.json({ data: entry });
    } catch (error) {
      console.log(error);
      next(error);
    }
  }

  async addBook(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { bookId, status, ownNote } = req.body;

      if (!bookId || typeof bookId !== 'string') {
        return res.status(400).json({ error: 'Missing or invalid bookId' });
      }

      // Проверяем, существует ли книга
      const bookExists = await prisma.book.findUnique({ where: { id: bookId } });
      if (!bookExists) {
        return res.status(404).json({ error: 'Book not found' });
      }

      const existing = await libraryService.getUserBook(userId, bookId);
      if (existing) {
        return res.status(409).json({ error: 'Book already in library' });
      }

      const newEntry = await libraryService.addBook(userId, {
        bookId,
        status: status as BookStatus,
        ownNote,
      });

      return res.status(201).json({ data: newEntry });
    } catch (error) {
      console.log(error);
      next(error);
    }
  }

  async updateBook(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { bookId } = req.params;
      if (!bookId || typeof bookId !== 'string') {
        return res.status(400).json({ error: 'Invalid bookId' });
      }

      const { status, ownNote } = req.body;

      const existing = await libraryService.getUserBook(userId, bookId);
      if (!existing) {
        return res.status(404).json({ error: 'Book not found in library' });
      }

      const updated = await libraryService.updateBook(userId, bookId, { status, ownNote });
      return res.json({ data: updated });
    } catch (error) {
      console.log(error);
      next(error);
    }
  }

  async removeBook(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { bookId } = req.params;
      if (!bookId || typeof bookId !== 'string') {
        return res.status(400).json({ error: 'Invalid bookId' });
      }

      const existing = await libraryService.getUserBook(userId, bookId);
      if (!existing) {
        return res.status(404).json({ error: 'Book not found in library' });
      }

      await libraryService.removeBook(userId, bookId);
      return res.status(204).send();
    } catch (error) {
      console.log(error);
      next(error);
    }
  }
}