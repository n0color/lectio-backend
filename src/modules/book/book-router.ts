// src/modules/books/book-router.ts
import { Router } from 'express';
import bookController from './book-controller';

export const bookRouter = Router();

// Получить книгу с главами и описанием
bookRouter.get('/:bookId', bookController.getBookWithChapters);

// Получить конкретную главу по номеру
bookRouter.get('/:bookId/chapters/:chapterNumber', bookController.getChapterByNumber);