// src/modules/book/book-controller.ts
import type { Request, Response, NextFunction } from 'express';
import recService from './rec-service';
import ApiError from '~/exceptions/api-error';

class RecController {

  async getBetaRecommendation(req: Request, res: Response, next: NextFunction) {
    try {
      const recommendations = await recService.betaRecommendations();
      res.status(201).json(recommendations);
    } catch (error) {
      next(error);
    }
  }

    async getNewest(req: Request, res: Response, next: NextFunction) {
    try {
      const recommendations = await recService.newestRecommendations();
      res.status(201).json(recommendations);
    } catch (error) {
      next(error);
    }
  }

  async getLikest(req: Request, res: Response, next: NextFunction) {
    try {
      const recommendations = await recService.likestRecommendations();
      res.status(201).json(recommendations);
    } catch (error) {
      next(error);
    }
  }

}

export default new RecController();