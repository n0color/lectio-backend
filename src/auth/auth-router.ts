import { Router } from "express";
import { UserController } from "~/user/user-controller";
import { AuthController } from "~/auth/auth-controller";
import { body } from "express-validator";

const authController = new AuthController();



export const authRouter = Router();

authRouter.post( '/registration', 
  body('email').isEmail(),
  body('password').isLength({ min: 8, max: 64}),
  authController.registration);
authRouter.post( '/login', authController.login);
authRouter.post( '/logout', authController.logout);
authRouter.get( '/refresh', authController.refresh);
