import { Router } from "express";
import { UserController } from "~/modules/user/user-controller";
import authMiddleware from "~/middleware/auth-middleware";
import { manageBookRouter } from "./manageBook/manageBook-router";
import { importBookRouter } from "./importBook/importBook-router";

const userController = new UserController();

export const userRouter = Router();

userRouter.get( '/activate/:link', userController.activate);
userRouter.use('/manage', authMiddleware, manageBookRouter)
userRouter.use('/import', authMiddleware, importBookRouter)
