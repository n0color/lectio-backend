import type { Request, Response, NextFunction } from "express";
import ApiError from "~/exceptions/api-error";
import authService from "../modules/auth/auth-service";
import UserDto from "~/dtos/user-dto";

export default function (req: Request, res: Response, next: NextFunction) {
  try {
    const authorizationHeader = req.get('authorization');
    if (!authorizationHeader) {
      return next(ApiError.UnauthorizedError());
    }

    const [bearer, accessToken] = authorizationHeader.split(' ');
    if (bearer !== 'Bearer' || !accessToken) {
      return next(ApiError.UnauthorizedError());
    }

    const userData = authService.validateAccessToken(accessToken);
    if (!userData || typeof userData === 'string') {
      return next(ApiError.UnauthorizedError());
    }
    req.user = new UserDto({
      id: userData.id,
      login: userData.login,
      isActive: userData.isActivated,
      role: userData.role,
    });
     next();
  } catch (error) {
    return next(ApiError.UnauthorizedError());
  }
}