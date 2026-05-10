import { Router } from "express";
import authMiddleware from "~/middleware/auth-middleware";
import { LibraryController } from "./library-controller";

const libraryController = new LibraryController();
export const libraryRouter = Router();

// GET /library/books?status=...&page=...
libraryRouter.get('/books', libraryController.getUserBooks.bind(libraryController));

// GET /library/books/:bookId
libraryRouter.get('/books/:bookId', libraryController.getUserBook.bind(libraryController));

// POST /library/books
libraryRouter.post('/books', libraryController.addBook.bind(libraryController));

// PATCH /library/books/:bookId
libraryRouter.patch('/books/:bookId', libraryController.updateBook.bind(libraryController));

// DELETE /library/books/:bookId
libraryRouter.delete('/books/:bookId', libraryController.removeBook.bind(libraryController));