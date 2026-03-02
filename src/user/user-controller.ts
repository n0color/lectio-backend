import type { Request, Response, NextFunction } from 'express'

export class UserController {


  async getUsers(req: Request, res: Response, next: NextFunction) {
    try {
      res.json(['123', 'fff']);
    } catch (error) {
      
    }
  }

}
