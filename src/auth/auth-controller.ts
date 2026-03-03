import type { Request, Response, NextFunction } from "express";
import authService from "./auth-service";
export class AuthController {
  async registration(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password, login } = req.body;
      const userAgent = req.headers['user-agent'];
      const userData = await authService.registration(email, password, login, userAgent);
      res.cookie('refreshToken', userData.refreshToken, {
         maxAge: 30 * 24 * 60 * 60 * 1000,
         httpOnly: true,
      });
      return res.json(userData);
       
    } catch (error) {
      console.log(error);
    }
  }
  async login(req: Request, res: Response, next: NextFunction) {
    try {
      
    } catch (error) {
      
    }
  }
  async logout(req: Request, res: Response, next: NextFunction) {
    try {
      
    } catch (error) {
      
    }
    
  }
  async refresh(req: Request, res: Response, next: NextFunction) {
    try {
      
    } catch (error) {
      
    }
    
  }
  async activate(req: Request, res: Response, next: NextFunction) {
    try {
      
    } catch (error) {
      
    }
    
  }

}