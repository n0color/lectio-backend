import { Router } from "express";
import authMiddleware from "~/middleware/auth-middleware";
import { AdminController } from "./admin-controller";
import requireAdmin from "~/middleware/admin-middleware";

const adminController = new AdminController();

export const adminRouter = Router();

adminRouter.use(requireAdmin);

adminRouter.get( '/users', authMiddleware, adminController.getUsers);
