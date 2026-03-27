import { Router } from 'express';
import authMiddleware from '~/middleware/auth-middleware';
import { ManageBookController } from './manageBook-controller';
import { canEditBook } from './middleware/canEditBook';

const bookController = new ManageBookController();
export const manageBookRouter = Router();
// Все маршруты книг требуют аутентификации (можно открыть некоторые, но пока так)
manageBookRouter.use(authMiddleware);

// Создание книги
manageBookRouter.post('/create', bookController.createBook);
manageBookRouter.post('/:bookId/addChapters', canEditBook, bookController.createChapter);
