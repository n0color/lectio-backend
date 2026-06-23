import { prisma } from "~/lib/prisma";
import { bookCardSelect, mapBookCard } from "~/lib/book-helpers";
import type { SearchUsersQuery, SearchBooksQuery, SearchUsersResponse, SearchBooksResponse } from '~/types/search';

class SearchService {

  async searchUsers({ q, limit = 5, offset = 0}: SearchUsersQuery): Promise<SearchUsersResponse> {
    if (!q.trim()) {
      return { items: [], total: 0, hasMore: false, nextOffset: offset };
    }
    const [items, total] = await Promise.all([
      prisma.user.findMany({
        where: {
          OR: [
            {nickname: { contains: q, mode: 'insensitive' }},
            {login: { contains: q, mode: 'insensitive' }},
          ]
        },
        select: {
          login: true,
          nickname: true,
          avatar: true,
          id: true,
        },
        skip: offset,
        take: limit,
        orderBy: { login: 'asc' },
      }),
      prisma.user.count({ where: {
        nickname: { contains: q, mode: 'insensitive' } 
      }, }),
    ]);
    const hasMore = offset + limit < total;
    const nextOffset = hasMore ? offset + limit : offset;
    return {
      items,
      total,
      hasMore,
      nextOffset,
    };
  }
  
  async searchBooks({ q, page = 1, perPage = 20 }: SearchBooksQuery): Promise<SearchBooksResponse> {
    if (!q.trim()) {
      return { items: [], total: 0, page, perPage, totalPages: 0 };
    }

    const where = {
      isApproved: true,
      OR: [
        { title: { contains: q, mode: 'insensitive' as const } },
        {
          author: {
            OR: [
              { nickname: { contains: q, mode: 'insensitive' as const  } },
            ],
          },
        },
        {
          coAuthor: {
            OR: [
              { nickname: { contains: q, mode: 'insensitive' as const  } },
            ],
          },
        },
      ],
    };

    const skip = (page - 1) * perPage;
    const [items, total] = await Promise.all([
      prisma.book.findMany({
        where,
        select: bookCardSelect,
        skip,
        take: perPage,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.book.count({ where }),
    ]);

    const totalPages = Math.ceil(total / perPage);
    return {
      items: items.map(mapBookCard),
      total,
      page,
      perPage,
      totalPages,
    };
  }

  // ----- НОВЫЕ МЕТОДЫ -----

  async getUserComments({ userId, limit = 10, offset = 0 }: { userId: string; limit?: number; offset?: number }) {
    if (!userId) {
      return { items: [], total: 0, hasMore: false, nextOffset: offset };
    }

    const [items, total] = await Promise.all([
      prisma.reviewComment.findMany({
        where: { userId },
        select: {
          id: true,
          content: true,
          createdAt: true,
          updatedAt: true,
          isDeleted: true,
          review: {
            select: {
              id: true,
              rating: true,
              book: {
                select: {
                  id: true,
                  title: true,
                }
              }
            }
          },
          user: {
            select: {
              id: true,
              login: true,
              nickname: true,
              avatar: true,
            }
          }
        },
        skip: offset,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.reviewComment.count({ where: { userId } }),
    ]);

    const hasMore = offset + limit < total;
    const nextOffset = hasMore ? offset + limit : offset;
    return {
      items,
      total,
      hasMore,
      nextOffset,
    };
  }

  async getUserBooks({ userId, limit = 10, offset = 0 }: { userId: string; limit?: number; offset?: number }) {
    if (!userId) {
      return { items: [], total: 0, hasMore: false, nextOffset: offset };
    }

    const where = {
      OR: [
        { authorId: userId },
        { coAuthorId: userId },
      ],
      isApproved: true, // возвращаем только одобренные книги (можно убрать, если нужны все)
    };

    const [items, total] = await Promise.all([
      prisma.book.findMany({
        where,
        select: bookCardSelect,
        skip: offset,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.book.count({ where }),
    ]);

    const hasMore = offset + limit < total;
    const nextOffset = hasMore ? offset + limit : offset;
    return {
      items: items.map(mapBookCard),
      total,
      hasMore,
      nextOffset,
    };
  }
  async getBooksByGenre({ genreId, page = 1, perPage = 20 }: { genreId: string; page?: number; perPage?: number }) {
    if (!genreId) {
      return { items: [], total: 0, page, perPage, totalPages: 0 };
    }

    const where = {
      isApproved: true,
      genreId: genreId,
    };

    const skip = (page - 1) * perPage;
    const [items, total] = await Promise.all([
      prisma.book.findMany({
        where,
        select: bookCardSelect,
        skip,
        take: perPage,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.book.count({ where }),
    ]);

    const totalPages = Math.ceil(total / perPage);
    return {
      items: items.map(mapBookCard),
      total,
      page,
      perPage,
      totalPages,
    };
  }
}

export default new SearchService();