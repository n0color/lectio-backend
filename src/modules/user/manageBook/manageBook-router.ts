import { Router } from 'express';
import { ManageBookController } from './manageBook-controller';
import { canEditBook } from './middleware/canEditBook';
import { uploadSingle } from './middleware/upload';

const bookController = new ManageBookController();
export const manageBookRouter = Router();


//Просмотр книг(и) и ёё глав
manageBookRouter.get('/my', bookController.getUserBooks);
manageBookRouter.get('/:bookId', bookController.getBookById);
// Получение главы по ID (с проверкой доступа через сервис)
manageBookRouter.get('/:bookId/:chapterId', bookController.getChapterById);
// Создание книги
manageBookRouter.post('/create', bookController.createBook);
manageBookRouter.post('/:bookId/cover', canEditBook, uploadSingle, bookController.uploadCover);
manageBookRouter.post('/:bookId/addChapters', canEditBook, bookController.createChapter);
manageBookRouter.put('/:bookId', canEditBook, bookController.updateBook);
manageBookRouter.delete('/:bookId', canEditBook, bookController.deleteBook);
manageBookRouter.put('/:bookId/:chapterId',canEditBook, bookController.updateChapter);
manageBookRouter.delete('/:bookId/:chapterId', canEditBook, bookController.deleteChapter)
