import { prisma } from "~/lib/prisma";
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
          // если есть поле avatarUrl – добавить
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
        select: {
          id: true,
          title: true,
          coverUrl: true,
          description: true,
          createdAt: true,
          author: {
            select: {
              nickname: true,
            },
          },
        },
        skip,
        take: perPage,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.book.count({ where }),
    ]);

    const totalPages = Math.ceil(total / perPage);
    return {
      items,
      total,
      page,
      perPage,
      totalPages,
    };
  }
  

}

export default new SearchService();