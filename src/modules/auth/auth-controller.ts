import type { Request, Response, NextFunction } from "express";
import authService from "./auth-service";
import { validationResult } from "express-validator";
import ApiError from "~/exceptions/api-error";
import userService from "~/modules/user/user-service";


export class AuthController {
  async registration(req: Request, res: Response, next: NextFunction) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return next(ApiError.BadRequest('Ошибка при валидации полей', errors.array()));
      }
      const { email, password, login } = req.body;
      const userAgent = req.headers['user-agent'];
      const userData = await authService.registration(email, password, login, userAgent);
      res.cookie('refreshToken', userData.refreshToken, {
         maxAge: 30 * 24 * 60 * 60 * 1000,
         httpOnly: true,
      });
      return res.json(userData);
       
    } catch (error) {
      next(error);
    }
  }
  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { password, login } = req.body;
      const userAgent = req.headers['user-agent'];
      const userData = await authService.login(password, login, userAgent);
      res.cookie('refreshToken', userData.refreshToken, {
        maxAge: 30 * 24 * 60 * 60 * 1000,
        httpOnly: true,
     });
     return res.json(userData);
    } catch (error) {
      next(error);
    }
  }
  async logout(req: Request, res: Response, next: NextFunction) {
    try {
      const {refreshToken} = req.cookies;
      const result = await authService.logout(refreshToken);
      res.clearCookie('refreshToken');
      return res.json(result);
    } catch (error) {
      next(error);
    }
    
  }
  async refresh(req: Request, res: Response, next: NextFunction) {
    try {
      const {refreshToken} = req.cookies;
      const userAgent = req.headers['user-agent'];
      const userData = await authService.refresh(refreshToken);
      res.cookie('refreshToken', userData.refreshToken, {
        maxAge: 30 * 24 * 60 * 60 * 1000,
        httpOnly: true,
     });
     return res.json(userData);
    } catch (error) {
      next(error);
    }
    
  }


}