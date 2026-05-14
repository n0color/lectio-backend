// src/modules/books/book-service.ts
import { prisma } from '~/lib/prisma';
import type { BookWithChaptersResponse, ChapterResponse } from '~/types/books';
import ApiError from '~/exceptions/api-error';

class BookService {

  async getBookWithChapters(bookId: string): Promise<BookWithChaptersResponse> {
    const book = await prisma.book.findUnique({
      where: { id: bookId, isApproved: true }, // только одобренные книги
      select: {
        id: true,
        title: true,
        description: true,
        coverUrl: true,
        createdAt: true,
        avgRating: true,
        reviewsCount: true,
        updatedAt: true,
        likes: true,
        genre: {
          select: { id: true, name: true },
        },
        author: {
          select: { nickname: true },
        },
        coAuthor: {
          select: { nickname: true },
        },
        tags: {
          select: {
            tag: {
              select: { id: true, name: true },
            },
          },
        },
        chapters: {
          select: {
            id: true,
            chapterNumber: true,
            title: true,
            createdAt: true,
          },
          orderBy: { chapterNumber: 'asc' },
        },
      },
    });

    if (!book) {
      throw ApiError.NotFound('Книга не найдена');
    }

    // Преобразуем tags в плоский массив
    const tags = book.tags.map((bt) => bt.tag);

    return {
      ...book,
      tags,
    };
  }

  /**
   * Получение конкретной главы по номеру внутри книги
   */
  async getChapterByNumber(bookId: string, chapterNumber: number): Promise<ChapterResponse> {
    // Сначала убедимся, что книга существует и одобрена
    const book = await prisma.book.findUnique({
      where: { id: bookId, isApproved: true },
      select: { id: true },
    });
    if (!book) {
      throw ApiError.NotFound('Книга не найдена');
    }

    const chapter = await prisma.chapter.findUnique({
      where: {
        bookId_chapterNumber: { bookId, chapterNumber },
      },
      select: {
        id: true,
        bookId: true,
        chapterNumber: true,
        title: true,
        content: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!chapter) {
      throw ApiError.NotFound('Глава не найдена');
    }

    return chapter;
  }
}

export default new BookService();