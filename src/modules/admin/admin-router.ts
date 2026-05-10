import { Router } from "express";
import authMiddleware from "~/middleware/auth-middleware";
import { AdminController } from "./admin-controller";
import requireAdmin from "~/middleware/admin-middleware";

const adminController = new AdminController();

export const adminRouter = Router();

adminRouter.use(requireAdmin);

adminRouter.get( '/users', adminController.getUsers);

adminRouter.get( '/books', adminController.getBooks);
adminRouter.get( '/books/:id', adminController.getBook);

adminRouter.get('/genres', adminController.getGenres);
adminRouter.post('/genres', adminController.createGenre);
adminRouter.put('/genres/:id', adminController.updateGenre);
adminRouter.delete('/genres/:id', adminController.deleteGenre);

adminRouter.get('/tickets', adminController.getSupportTickets);
adminRouter.patch('/tickets/:id/status', adminController.updateTicketStatus);