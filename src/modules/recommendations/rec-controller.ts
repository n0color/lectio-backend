// src/modules/book/book-controller.ts
import type { Request, Response, NextFunction } from 'express';
import recService from './rec-service';
import ApiError from '~/exceptions/api-error';

class RecController {

  async getBetaRecommendation(req: Request, res: Response, next: NextFunction) {
    try {
      const recommendations = await recService.betaRecommendations();
      res.json(recommendations);
    } catch (error) {
      next(error);
    }
  }

    async getNewest(req: Request, res: Response, next: NextFunction) {
    try {
      const recommendations = await recService.newestRecommendations();
      res.json(recommendations);
    } catch (error) {
      next(error);
    }
  }

  async getLikest(req: Request, res: Response, next: NextFunction) {
    try {
      const recommendations = await recService.likestRecommendations();
      res.json(recommendations);
    } catch (error) {
      next(error);
    }
  }
  async getGenres(req: Request, res: Response, next: NextFunction) {
    try {
      const genres = await recService.genres();
      res.json({ items: genres });
    } catch (error) {
      next(error);
    }
  }

}

export default new RecController();