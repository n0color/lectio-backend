import type { Request, Response, NextFunction } from 'express'
import { Router } from 'express';
import { authRouter } from './modules/auth/auth-router';
import { userRouter } from './modules/user/user-router';
import { adminRouter } from './modules/admin/admin-router';
import authMiddleware from './middleware/auth-middleware';
import { searchRouter } from './modules/search/search-router';

export const router = Router();

router.get('/', (req: Request, res: Response) => {
  res.status(200).send('working...');
});
router.use('/auth', authRouter);
router.use('/search', searchRouter);
router.use('/user', authMiddleware, userRouter);
router.use('/admin', authMiddleware, adminRouter);