// src/modules/review/review-controller.ts
import type { Request, Response, NextFunction } from "express";
import reviewService from "./review-service";
import { validationResult } from "express-validator";
import ApiError from "~/exceptions/api-error";

export class ReviewController {
  async createReview(req: Request, res: Response, next: NextFunction) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return next(ApiError.BadRequest("Validation error", errors.array()));
      }
      const userId = req.user?.id;
      if (!userId) return next(ApiError.UnauthorizedError());

      const { bookId, rating, content } = req.body;
      if (!bookId || typeof bookId !== "string") {
        return next(ApiError.BadRequest("bookId must be a string"));
      }
      if (typeof rating !== "number" || rating < 1 || rating > 5) {
        return next(ApiError.BadRequest("rating must be a number between 1 and 5"));
      }

      const review = await reviewService.createReview({
        userId,
        bookId,
        rating,
        content: typeof content === "string" ? content : undefined,
      });
      return res.status(201).json({ data: review });
    } catch (error) {
      next(error);
    }
  }

  async getBookReviews(req: Request, res: Response, next: NextFunction) {
    try {
      const { bookId } = req.params;
      if (!bookId || typeof bookId !== "string") {
        return next(ApiError.BadRequest("bookId is required"));
      }

      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const includeComments = req.query.includeComments === "true";

      const { reviews, total } = await reviewService.getReviewsByBook({
        bookId,
        page,
        limit,
        includeComments,
      });

      return res.json({
        data: reviews,
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

  async getReview(req: Request, res: Response, next: NextFunction) {
    try {
      const { reviewId } = req.params;
      if (!reviewId || typeof reviewId !== "string") {
        return next(ApiError.BadRequest("reviewId is required"));
      }
      const review = await reviewService.getReviewById(reviewId);
      return res.json({ data: review });
    } catch (error) {
      next(error);
    }
  }

  async updateReview(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) return next(ApiError.UnauthorizedError());

      const { reviewId } = req.params;
      if (!reviewId || typeof reviewId !== "string") {
        return next(ApiError.BadRequest("reviewId is required"));
      }

      const { rating, content } = req.body;
      const updateData: { rating?: number; content?: string } = {};
      if (rating !== undefined) {
        if (typeof rating !== "number" || rating < 1 || rating > 5) {
          return next(ApiError.BadRequest("rating must be a number between 1 and 5"));
        }
        updateData.rating = rating;
      }
      if (content !== undefined) {
        if (typeof content !== "string") {
          return next(ApiError.BadRequest("content must be a string"));
        }
        updateData.content = content;
      }

      const updated = await reviewService.updateReview(reviewId, userId, updateData);
      return res.json({ data: updated });
    } catch (error) {
      next(error);
    }
  }

  async deleteReview(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) return next(ApiError.UnauthorizedError());

      const { reviewId } = req.params;
      if (!reviewId || typeof reviewId !== "string") {
        return next(ApiError.BadRequest("reviewId is required"));
      }

      const isAdmin = req.user?.role === "ADMIN";
      await reviewService.deleteReview(reviewId, userId, isAdmin);
      return res.status(204).send();
    } catch (error) {
      next(error);
    }
  }

  // ========== КОММЕНТАРИИ К ОТЗЫВАМ ==========
  async createComment(req: Request, res: Response, next: NextFunction) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return next(ApiError.BadRequest("Validation error", errors.array()));
      }
      const userId = req.user?.id;
      if (!userId) return next(ApiError.UnauthorizedError());

      const { reviewId } = req.params;
      if (!reviewId || typeof reviewId !== "string") {
        return next(ApiError.BadRequest("reviewId is required"));
      }

      const { content } = req.body;
      if (typeof content !== "string" || content.trim().length === 0) {
        return next(ApiError.BadRequest("content is required and must be a string"));
      }

      const comment = await reviewService.createComment({
        userId,
        reviewId,
        content,
      });
      return res.status(201).json({ data: comment });
    } catch (error) {
      next(error);
    }
  }

  async getReviewComments(req: Request, res: Response, next: NextFunction) {
    try {
      const { reviewId } = req.params;
      if (!reviewId || typeof reviewId !== "string") {
        return next(ApiError.BadRequest("reviewId is required"));
      }

      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;

      const { comments, total } = await reviewService.getCommentsByReview(reviewId, page, limit);
      return res.json({
        data: comments,
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

  async updateComment(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) return next(ApiError.UnauthorizedError());

      const { commentId } = req.params;
      if (!commentId || typeof commentId !== "string") {
        return next(ApiError.BadRequest("commentId is required"));
      }

      const { content } = req.body;
      if (typeof content !== "string" || content.trim().length === 0) {
        return next(ApiError.BadRequest("content is required and must be a string"));
      }

      const updated = await reviewService.updateComment(commentId, userId, content);
      return res.json({ data: updated });
    } catch (error) {
      next(error);
    }
  }

  async deleteComment(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) return next(ApiError.UnauthorizedError());

      const { commentId } = req.params;
      if (!commentId || typeof commentId !== "string") {
        return next(ApiError.BadRequest("commentId is required"));
      }

      const isAdmin = req.user?.role === "ADMIN";
      await reviewService.deleteComment(commentId, userId, isAdmin);
      return res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
}