import { Router } from "express";
import { UserController } from "~/user/user-controller";
import { AuthController } from "~/auth/auth-controller";
import { body } from "express-validator";
import authMiddleware from "~/auth/auth-middleware";

const authController = new AuthController();
const userController = new UserController();



export const apiRouter = Router();

apiRouter.post( '/registration', 
  body('email').isEmail(),
  body('password').isLength({ min: 8, max: 64}),
  authController.registration);
apiRouter.post( '/login', authController.login);
apiRouter.post( '/logout', authController.logout);
apiRouter.get( '/activate/:link', userController.activate);
apiRouter.get( '/refresh', authController.refresh);
apiRouter.get( '/users', authMiddleware, userController.getUsers);
