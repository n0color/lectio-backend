import { Request } from 'express';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        role: string;
        login: string;
        nickname?: string;
        isActivated?: boolean;
      };
    }
  }
}