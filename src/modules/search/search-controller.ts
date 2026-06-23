// src/modules/search/search.controller.ts
import type { Request, Response, NextFunction } from 'express';
import searchService from './search-service';
import ApiError from '~/exceptions/api-error';

class SearchController {
  
  async searchUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const q = req.query.q as string;
      if (!q) {
        throw ApiError.BadRequest('Query parameter "q" is required');
      }
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : undefined;
      const offset = req.query.offset ? parseInt(req.query.offset as string, 10) : undefined;

      const result = await searchService.searchUsers({
        q,
        limit: limit && !isNaN(limit) ? limit : undefined,
        offset: offset && !isNaN(offset) ? offset : undefined,
      });
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  async searchBooks(req: Request, res: Response, next: NextFunction) {
    try {
      const q = req.query.q as string;
      if (!q) {
        throw ApiError.BadRequest('Query parameter "q" is required');
      }
      const page = req.query.page ? parseInt(req.query.page as string, 10) : undefined;
      const perPage = req.query.per_page ? parseInt(req.query.per_page as string, 10) : undefined;

      const result = await searchService.searchBooks({
        q,
        page: page && !isNaN(page) ? page : undefined,
        perPage: perPage && !isNaN(perPage) ? perPage : undefined,
      });
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  // ----- НОВЫЕ МЕТОДЫ -----

  async searchUserComments(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.query.userId as string;
      if (!userId) {
        throw ApiError.BadRequest('Query parameter "userId" is required');
      }
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : undefined;
      const offset = req.query.offset ? parseInt(req.query.offset as string, 10) : undefined;

      const result = await searchService.getUserComments({
        userId,
        limit: limit && !isNaN(limit) ? limit : undefined,
        offset: offset && !isNaN(offset) ? offset : undefined,
      });
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  async searchUserBooks(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.query.userId as string;
      if (!userId) {
        throw ApiError.BadRequest('Query parameter "userId" is required');
      }
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : undefined;
      const offset = req.query.offset ? parseInt(req.query.offset as string, 10) : undefined;

      const result = await searchService.getUserBooks({
        userId,
        limit: limit && !isNaN(limit) ? limit : undefined,
        offset: offset && !isNaN(offset) ? offset : undefined,
      });
      res.json(result);
    } catch (err) {
      next(err);
    }
  }
  
  async getBooksByGenre(req: Request, res: Response, next: NextFunction) {
    try {
      const genreId = req.query.genreId as string;
      if (!genreId) {
        throw ApiError.BadRequest('Query parameter "genreId" is required');
      }
      const page = req.query.page ? parseInt(req.query.page as string, 10) : undefined;
      const perPage = req.query.per_page ? parseInt(req.query.per_page as string, 10) : undefined;

      const result = await searchService.getBooksByGenre({
        genreId,
        page: page && !isNaN(page) ? page : undefined,
        perPage: perPage && !isNaN(perPage) ? perPage : undefined,
      });
      res.json(result);
    } catch (err) {
      next(err);
    }
  }
}

export default new SearchController();