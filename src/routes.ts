import type { Request, Response, NextFunction } from 'express'
import { Router } from 'express';
import { authRouter } from './modules/auth/auth-router';
import { userRouter } from './modules/user/user-router';
import { adminRouter } from './modules/admin/admin-router';
import authMiddleware from './middleware/auth-middleware';
import { searchRouter } from './modules/search/search-router';
import { bookRouter } from './modules/book/book-router';
import { recRouter } from './modules/recommendations/rec-router';
import { libraryRouter } from './modules/libary/library-router';

export const router = Router();

router.get('/', (req: Request, res: Response) => {
  res.status(200).send('working...');
});
router.use('/rec', recRouter);
router.use('/auth', authRouter);
router.use('/books', bookRouter);
router.use('/search', searchRouter);
router.use('/user', authMiddleware, userRouter);
router.use('/admin', authMiddleware, adminRouter);
router.use('/library', authMiddleware, libraryRouter);