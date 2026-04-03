import { Router } from 'express';
import { ManageBookController } from './manageBook-controller';
import { canEditBook } from './middleware/canEditBook';

const bookController = new ManageBookController();
export const manageBookRouter = Router();

// Создание книги
manageBookRouter.post('/create', bookController.createBook);
manageBookRouter.post('/:bookId/addChapters', canEditBook, bookController.createChapter);
manageBookRouter.put('/:bookId', canEditBook, bookController.updateBook);
manageBookRouter.delete('/:bookId', canEditBook, bookController.deleteBook);
manageBookRouter.put('/chapters/:chapterId', bookController.updateChapter);
manageBookRouter.delete('/chapters/:chapterId', bookController.deleteChapter)
