import type { Express, Request, Response, NextFunction } from 'express'
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { config } from 'dotenv';

import { router } from './routes.js';
import errorHandler from './exceptions/error-middleware.js';

export default function buildApp(): Express {
  config();
  const app = express();

  app.use(express.json());
  app.use(cookieParser());
  app.use(cors({
    credentials: true,
    origin: process.env.CLIENT_URL,
  }));
  app.use('/', router);
  app.use(errorHandler);

  return app;
}