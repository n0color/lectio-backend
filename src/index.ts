import type { Express, Request, Response, NextFunction } from 'express'
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { config } from 'dotenv';

import { router } from './routes.js';
import errorHandler from './middleware/error-middleware.js';

export default function buildApp(): Express {
  config();
  const app = express();
  app.use('/static/covers', express.static('uploads/covers'));
  app.use(express.json({ limit: '200kb' }));
  app.use(cookieParser());
  app.use(cors({
    credentials: true,
    origin: true,
  }));
  app.use('/api', router);
  app.use(errorHandler);

  return app;
}