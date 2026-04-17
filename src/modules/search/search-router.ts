// src/modules/search/search.router.ts
import { Router } from 'express';
import searchController from './search-controller';

export const searchRouter = Router();

// Поиск пользователей
searchRouter.get('/users', searchController.searchUsers);
// Поиск книг
searchRouter.get('/books', searchController.searchBooks);