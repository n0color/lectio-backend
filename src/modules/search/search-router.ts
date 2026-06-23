// src/modules/search/search.router.ts
import { Router } from 'express';
import searchController from './search-controller';

export const searchRouter = Router();

// Поиск пользователей
searchRouter.get('/users', searchController.searchUsers);
// Поиск книг
searchRouter.get('/books', searchController.searchBooks);

// ----- НОВЫЕ МАРШРУТЫ -----
// Комментарии пользователя (по userId)
searchRouter.get('/user-comments', searchController.searchUserComments);
// Книги пользователя (по userId)
searchRouter.get('/user-books', searchController.searchUserBooks);
searchRouter.get('/books/by-genre', searchController.getBooksByGenre);