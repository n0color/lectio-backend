import type { Request, Response, NextFunction } from 'express'
import ApiError from '~/exceptions/api-error';
import adminService from './admin-service';
import { SupportTicketStatus, SupportTicketType } from '../../../generated/prisma/enums';

export class AdminController {


  async getUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
     
      const [ users, total ] = await adminService.getAllUsers(page, limit);

      return res.json({
        data: users,
        meta: {
          page,
          limit,
          total,
          totalPages: Math.ceil( total / limit),
        }
      });
    } catch (error) {
      next(error);
    }
  }

  async getBooks(req: Request, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
     
      const [ books, total ] = await adminService.getAllBooks(page, limit);

      return res.json({
        data: books,
        meta: {
          page,
          limit,
          total,
          totalPages: Math.ceil( total / limit),
        }
      });
    } catch (error) {
      next(error);
    }
  }

  async getGenres(req: Request, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;

      const [genres, total] = await adminService.getAllGenres(page, limit);

      return res.json({
        data: genres,
        meta: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      });
    } catch (error) {
      next(error);
    }
  }

  // GET /genres/:id
  async getGenre(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const genre = await adminService.getGenreById(id);

      if (!genre) {
        return res.status(404).json({ error: 'Genre not found' });
      }

      return res.json({ data: genre });
    } catch (error) {
      next(error);
    }
  }

  // POST /genres
  async createGenre(req: Request, res: Response, next: NextFunction) {
    try {
      const { name, description } = req.body;

      if (!name || typeof name !== 'string') {
        return res.status(400).json({ error: 'Missing or invalid "name" field' });
      }

      const newGenre = await adminService.createGenre({ name, description });
      return res.status(201).json({ data: newGenre });
    } catch (error: any) {
      // Обработка уникальности name
      if (error.code === 'P2002' && error.meta?.target?.includes('name')) {
        return res.status(409).json({ error: 'Genre with this name already exists' });
      }
      next(error);
    }
  }

  // PUT /genres/:id
  async updateGenre(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const { name, description } = req.body;

      // Проверяем существование жанра
      const existing = await adminService.getGenreById(id);
      if (!existing) {
        return res.status(404).json({ error: 'Genre not found' });
      }

      const updated = await adminService.updateGenre(id, { name, description });
      return res.json({ data: updated });
    } catch (error: any) {
      if (error.code === 'P2002' && error.meta?.target?.includes('name')) {
        return res.status(409).json({ error: 'Genre with this name already exists' });
      }
      next(error);
    }
  }

  // DELETE /genres/:id
  async deleteGenre(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;

      const existing = await adminService.getGenreById(id);
      if (!existing) {
        return res.status(404).json({ error: 'Genre not found' });
      }

      await adminService.deleteGenre(id);
      return res.status(204).send(); // No content
    } catch (error) {
      next(error);
    }
  }

    async getSupportTickets(req: Request, res: Response, next: NextFunction) {
    try {
      const { status, type, page = 1, limit = 20 } = req.query;

      const filters: any = {
        page: parseInt(page as string, 10),
        limit: parseInt(limit as string, 10),
      }

      const [tickets, total] = await adminService.getAllSupportTickets(filters);

      return res.json({
        data: tickets,
        meta: {
          page: filters.page,
          limit: filters.limit,
          total,
          totalPages: Math.ceil(total / filters.limit),
        },
      });
    } catch (error) {
      next(error);
    }
  }

  // PATCH /admin/tickets/:id/status
  async updateTicketStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!id || typeof id !== 'string') {
      return res.status(400).json({ error: 'Invalid or missing ticket ID' });
    }
      // Валидация статуса
      if (!status || !Object.values(SupportTicketStatus).includes(status as SupportTicketStatus)) {
        return res.status(400).json({ error: 'Invalid or missing status' });
      }

      const updated = await adminService.updateTicketStatus(id, status as SupportTicketStatus);
      return res.json({ data: updated });
    } catch (error) {
      next(error);
    }
  }

  async getBook(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
     
      const book = await adminService.getBookById(id);

      return res.json({
        data: book,
      });
    } catch (error) {
      next(error);
    }
  }

}
