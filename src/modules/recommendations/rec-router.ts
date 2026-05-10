// src/modules/books/book-router.ts
import { Router } from 'express';
import recController from './rec-controller';

export const recRouter = Router();

recRouter.get('/', recController.getBetaRecommendation);
recRouter.get('/newest', recController.getNewest);
recRouter.get('/likest', recController.getLikest);
recRouter.get('/genres', recController.getGenres);