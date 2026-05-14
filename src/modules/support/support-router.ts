// src/modules/support/support-router.ts
import { Router } from "express";
import { body } from "express-validator";
import authMiddleware from "~/middleware/auth-middleware";
import { SupportController } from "./support-controller";

const supportController = new SupportController();
export const supportRouter = Router();

// Все роуты требуют авторизации
supportRouter.use(authMiddleware);

// POST /support/tickets - создание тикета
supportRouter.post(
  "/tickets",
  body("type").isIn(["BUG", "FEATURE_REQUEST", "CONTENT_COMPLAINT", "ACCOUNT_ISSUE", "PAYMENT", "OTHER"]),
  body("message").notEmpty().isLength({ min: 5, max: 5000 }),
  supportController.createTicket
);
