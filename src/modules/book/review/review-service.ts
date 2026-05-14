// src/modules/review/review-service.ts
import { prisma } from "~/lib/prisma";
import ApiError from "~/exceptions/api-error";

interface CreateReviewData {
  userId: string;
  bookId: string;
  rating: number;
  content?: string;
}

interface UpdateReviewData {
  rating?: number;
  content?: string;
}

interface CreateCommentData {
  userId: string;
  reviewId: string;
  content: string;
}

interface GetReviewsParams {
  bookId: string;
  page?: number;
  limit?: number;
  includeComments?: boolean;
}

class ReviewService {
  async createReview(data: CreateReviewData) {
    const existing = await prisma.review.findUnique({
      where: {
        userId_bookId: {
          userId: data.userId,
          bookId: data.bookId,
        },
      },
    });
    if (existing) {
      throw ApiError.BadRequest("You have already reviewed this book");
    }

    const review = await prisma.review.create({
      data: {
        userId: data.userId,
        bookId: data.bookId,
        rating: data.rating,
        content: data.content,
      },
      include: {
        user: {
          select: { id: true, login: true, nickname: true, avatar: true },
        },
      },
    });

    await this.updateBookRating(data.bookId);
    return review;
  }

  async getReviewsByBook({ bookId, page = 1, limit = 20, includeComments = false }: GetReviewsParams) {
    const skip = (page - 1) * limit;

    const [reviews, total] = await prisma.$transaction([
      prisma.review.findMany({
        where: { bookId },
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          user: {
            select: { id: true, login: true, nickname: true, avatar: true },
          },
          ...(includeComments && {
            comments: {
              where: { isDeleted: false },
              orderBy: { createdAt: "asc" },
              include: {
                user: {
                  select: { id: true, login: true, nickname: true, avatar: true },
                },
              },
            },
          }),
        },
      }),
      prisma.review.count({ where: { bookId } }),
    ]);

    return { reviews, total };
  }

  async getReviewById(reviewId: string) {
    const review = await prisma.review.findUnique({
      where: { id: reviewId },
      include: {
        user: { select: { id: true, login: true, nickname: true, avatar: true } },
        comments: {
          where: { isDeleted: false },
          orderBy: { createdAt: "asc" },
          include: {
            user: { select: { id: true, login: true, nickname: true, avatar: true } },
          },
        },
      },
    });
    if (!review) throw ApiError.BadRequest("Review not found");
    return review;
  }

  async updateReview(reviewId: string, userId: string, data: UpdateReviewData) {
    const review = await prisma.review.findUnique({ where: { id: reviewId } });
    if (!review) throw ApiError.BadRequest("Review not found");
    if (review.userId !== userId) throw ApiError.Forbidden("You can only edit your own review");

    const updated = await prisma.review.update({
      where: { id: reviewId },
      data: {
        rating: data.rating,
        content: data.content,
      },
      include: {
        user: { select: { id: true, login: true, nickname: true, avatar: true } },
      },
    });

    if (data.rating !== undefined) {
      await this.updateBookRating(review.bookId);
    }
    return updated;
  }

  async deleteReview(reviewId: string, userId: string, isAdmin = false) {
    const review = await prisma.review.findUnique({ where: { id: reviewId } });
    if (!review) throw ApiError.BadRequest("Review not found");
    if (!isAdmin && review.userId !== userId) throw ApiError.Forbidden("You can only delete your own review");

    // Удаляем все комментарии к этому отзыву (каскадно по БД)
    await prisma.review.delete({ where: { id: reviewId } });
    await this.updateBookRating(review.bookId);
    return { message: "Review deleted" };
  }

  // ========== КОММЕНТАРИИ К ОТЗЫВАМ ==========
  async createComment(data: CreateCommentData) {
    // Проверяем существование отзыва
    const review = await prisma.review.findUnique({ where: { id: data.reviewId } });
    if (!review) throw ApiError.BadRequest("Review not found");

    const comment = await prisma.reviewComment.create({
      data: {
        userId: data.userId,
        reviewId: data.reviewId,
        content: data.content,
      },
      include: {
        user: { select: { id: true, login: true, nickname: true, avatar: true } },
        review: {
          select: { id: true, bookId: true },
        },
      },
    });
    return comment;
  }

  async getCommentsByReview(reviewId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const [comments, total] = await prisma.$transaction([
      prisma.reviewComment.findMany({
        where: { reviewId, isDeleted: false },
        skip,
        take: limit,
        orderBy: { createdAt: "asc" },
        include: {
          user: { select: { id: true, login: true, nickname: true, avatar: true } },
        },
      }),
      prisma.reviewComment.count({ where: { reviewId, isDeleted: false } }),
    ]);

    return { comments, total };
  }

  async updateComment(commentId: string, userId: string, content: string) {
    const comment = await prisma.reviewComment.findUnique({ where: { id: commentId } });
    if (!comment) throw ApiError.BadRequest("Comment not found");
    if (comment.userId !== userId) throw ApiError.Forbidden("You can only edit your own comment");

    const updated = await prisma.reviewComment.update({
      where: { id: commentId },
      data: { content, updatedAt: new Date() },
      include: {
        user: { select: { id: true, login: true, nickname: true, avatar: true } },
      },
    });
    return updated;
  }

  async deleteComment(commentId: string, userId: string, isAdmin = false) {
    const comment = await prisma.reviewComment.findUnique({ where: { id: commentId } });
    if (!comment) throw ApiError.BadRequest("Comment not found");
    if (!isAdmin && comment.userId !== userId) throw ApiError.Forbidden("You can only delete your own comment");

    // Мягкое удаление (скрытие)
    await prisma.reviewComment.update({
      where: { id: commentId },
      data: { isDeleted: true },
    });
    return { message: "Comment deleted (hidden)" };
  }

  // Вспомогательная: пересчёт рейтинга книги
  private async updateBookRating(bookId: string) {
    const result = await prisma.review.aggregate({
      where: { bookId },
      _avg: { rating: true },
      _count: { rating: true },
    });
    const avgRating = result._avg.rating ?? 0;
    const reviewsCount = result._count.rating ?? 0;

    await prisma.book.update({
      where: { id: bookId },
      data: {
        avgRating,
        reviewsCount,
      },
    });
  }
}

export default new ReviewService();