// src/modules/review/review-router.ts
import { Router } from "express";
import { body } from "express-validator";
import authMiddleware from "~/middleware/auth-middleware";
import { ReviewController } from "./review-controller";

const reviewController = new ReviewController();
export const reviewRouter = Router();

reviewRouter.get("/book/:bookId", reviewController.getBookReviews);

reviewRouter.get("/:reviewId", reviewController.getReview);

reviewRouter.post(
  "/",
  authMiddleware,
  body("bookId").isString().notEmpty(),
  body("rating").isInt({ min: 1, max: 5 }),
  body("content").optional().isString().isLength({ max: 2000 }),
  reviewController.createReview
);

reviewRouter.patch(
  "/:reviewId",
  authMiddleware,
  body("rating").optional().isInt({ min: 1, max: 5 }),
  body("content").optional().isString().isLength({ max: 2000 }),
  reviewController.updateReview
);

reviewRouter.delete("/:reviewId", authMiddleware, reviewController.deleteReview);


reviewRouter.get("/:reviewId/comments", reviewController.getReviewComments);

reviewRouter.post(
  "/:reviewId/comments",
  authMiddleware,
  body("content").isString().notEmpty().isLength({ min: 1, max: 1000 }),
  reviewController.createComment
);

reviewRouter.patch(
  "/comments/:commentId",
  authMiddleware,
  body("content").isString().notEmpty().isLength({ min: 1, max: 1000 }),
  reviewController.updateComment
);

reviewRouter.delete("/comments/:commentId", authMiddleware, reviewController.deleteComment);