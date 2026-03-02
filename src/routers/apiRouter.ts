import { Router } from "express";
import { UserController } from "~/user/user-controller";
import { AuthController } from "~/auth/auth-controller";

const authController = new AuthController();
const userController = new UserController();

export const apiRouter = Router();

apiRouter.post( '/registration', authController.registration);
apiRouter.post( '/login', authController.login);
apiRouter.post( '/logout', authController.logout);
apiRouter.get( '/activate/:link', authController.activate);
apiRouter.get( '/refresh', authController.refresh);
apiRouter.get( '/users', userController.getUsers);
