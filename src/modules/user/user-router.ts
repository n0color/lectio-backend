import { Router } from "express";
import { UserController } from "~/modules/user/user-controller";
import authMiddleware from "~/middleware/auth-middleware";

const userController = new UserController();

export const userRouter = Router();

userRouter.get( '/activate/:link', userController.activate);
userRouter.get( '/users', authMiddleware, userController.getUsers);
