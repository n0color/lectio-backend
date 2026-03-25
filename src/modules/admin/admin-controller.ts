import type { Request, Response, NextFunction } from 'express'
import ApiError from '~/exceptions/api-error';
import adminService from './admin-service';

export class AdminController {


  async getUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      console.log(`Админ ${req.user?.login} запросил данные о пользователях`);
      const [ users, total ] = await adminService.getAllUsers(page, limit);

      return res.json({
        data: users,
        meta: {
          page,
          limit,
          total,
          totalPages: Math.ceil( total / limit),
        }
      });
    } catch (error) {
      next(error);
    }
  }

}
