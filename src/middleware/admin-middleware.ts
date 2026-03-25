import type { Request, Response, NextFunction } from "express";
import ApiError from "~/exceptions/api-error";
import authService from "../modules/auth/auth-service";
import UserDto from "~/dtos/user-dto";

export default function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (!req.user) {
    return next(ApiError.UnauthorizedError());
  }
  if (req.user.role !== 'ADMIN') {
    return next(ApiError.InternalError("Нет доступа")); // 403
  }
  next();
}