// src/modules/support/support-controller.ts
import type { Request, Response, NextFunction } from "express";
import supportService from "./support-service";
import { validationResult } from "express-validator";
import ApiError from "~/exceptions/api-error";

export class SupportController {
  // Создание тикета
  async createTicket(req: Request, res: Response, next: NextFunction) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return next(ApiError.BadRequest("Validation error", errors.array()));
      }

      const userId = req.user?.id;
      if (!userId) {
        return next(ApiError.UnauthorizedError());
      }

      const { type, message } = req.body;
      const ticket = await supportService.createTicket(userId, { type, message });
      return res.status(201).json({ data: ticket });
    } catch (error) {
      next(error);
    }
  }
}
