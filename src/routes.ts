import type { Request, Response, NextFunction } from 'express'
import { Router } from 'express';
import { authRouter } from './auth/auth-router';
import { userRouter } from './user/user-router';

export const router = Router();

router.get('/', (req: Request, res: Response) => {
  res.status(200).send('working...');
});
router.use('/auth', authRouter);
router.use('/user', userRouter);
