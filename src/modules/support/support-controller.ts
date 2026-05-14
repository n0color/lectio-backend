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

  // Получение списка своих тикетов
  async getUserTickets(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return next(ApiError.UnauthorizedError());
      }

      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;

      const { tickets, total } = await supportService.getUserTickets({
        userId,
        page,
        limit,
      });

      return res.json({
        data: tickets,
        meta: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      });
    } catch (error) {
      next(error);
    }
  }

  // Получение конкретного тикета
  async getTicket(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return next(ApiError.UnauthorizedError());
      }

      const { id } = req.params;
      if (!id) {
        return next(ApiError.BadRequest("Ticket id is required"));
      }

      // isAdmin = false, т.к. этот метод только для пользователей
      const ticket = await supportService.getTicketById(id, userId, false);
      return res.json({ data: ticket });
    } catch (error) {
      next(error);
    }
  }
}