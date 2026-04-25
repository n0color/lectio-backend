import type { Request, Response, NextFunction } from 'express'
import userService from './user-service';
import ApiError from '~/exceptions/api-error';

export class UserController {

  async activate(req: Request, res: Response, next: NextFunction) {
    try {
      const { link } = req.params;
      if (!link || typeof link !== 'string') {
        throw new Error("Ссылка на активацию отсутсвует или некорректна");
      }
      console.log(link);
      await userService.activate(link);
      if (process.env.CLIENT_URL) return res.redirect(process.env.CLIENT_URL);
      else  { 
        console.log("Не задан URL клиента!"); 
        throw ApiError.InternalError('Ошибка на сервере, сообщите администратору!');
      }
    } catch (error) {
      next(error);
    }
  }

}
