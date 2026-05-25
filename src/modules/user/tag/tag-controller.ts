import type { NextFunction, Request, Response } from "express";
import ApiError from "~/exceptions/api-error";
import tagService from "./tag-service";

export class TagController {
  async getTags(req: Request, res: Response, next: NextFunction) {
    try {
      const q = typeof req.query.q === "string" ? req.query.q : undefined;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 30;

      const tags = await tagService.searchTags(q, Number.isNaN(limit) ? 30 : limit);
      res.json({ items: tags });
    } catch (error) {
      next(error);
    }
  }

  async createTag(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw ApiError.UnauthorizedError();
      }

      const { name } = req.body as { name?: string };
      if (!name || typeof name !== "string") {
        throw ApiError.BadRequest('Поле "name" обязательно');
      }

      const tag = await tagService.createTag(userId, name);
      res.status(201).json(tag);
    } catch (error) {
      next(error);
    }
  }
}
