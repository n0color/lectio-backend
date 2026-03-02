import type { Request, Response, NextFunction } from 'express'
import { Router } from 'express';
import { apiRouter } from './routers/apiRouter';

export const router = Router();

router.get('/', (req: Request, res: Response) => {
  res.status(200).send('working...');
});
router.use('/api', apiRouter);
