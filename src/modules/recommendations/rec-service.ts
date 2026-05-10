// src/modules/books/book-service.ts
import { prisma } from '~/lib/prisma';
import type { BookWithChaptersResponse, ChapterResponse } from '~/types/books';
import ApiError from '~/exceptions/api-error';


class RecService {

  async betaRecommendations():Promise<any>  {
    
    const randomBooks = await prisma.$queryRaw<Array<{
      id: string;
      title: string;
      coverUrl: string | null;
      description: string | null;
      createdAt: Date;
      authorNickname: string | null;
    }>>`
      SELECT 
        b.id, 
        b.title, 
        b."coverUrl", 
        b.description, 
        b."createdAt",
        u.nickname AS "authorNickname"
      FROM books b
      LEFT JOIN users u ON b."authorId" = u.id
      ORDER BY random()
      LIMIT 10
    `;
    const books = randomBooks.map(book => ({
      id: book.id,
      title: book.title,
      coverUrl: book.coverUrl,
      description: book.description,
      createdAt: book.createdAt,
      author: { nickname: book.authorNickname }
    }));

    return books;
  }

  async newestRecommendations():Promise<any> {

    const newestBooks = await prisma.book.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        coverUrl: true,
        description: true,
        createdAt: true,
        author: {          // связь через authorId
          select: {
            nickname: true,
          },
        },
      },
    });

    return newestBooks;
  }

  async likestRecommendations():Promise<any> {

    const likestBooks = await prisma.book.findMany({
      take: 10,
      orderBy: { likes: 'desc' },
      select: {
        id: true,
        title: true,
        coverUrl: true,
        description: true,
        createdAt: true,
        author: {          // связь через authorId
          select: {
            nickname: true,
          },
        },
      },
    });
    return likestBooks;
  }

  async genres():Promise<any> {

    const genres = await prisma.genre.findMany({
      take: 10,
      orderBy: { name: 'desc' },
      select: {
        id: true,
        name: true,
      }
      },
    )
    return genres;
  }
}

export default new RecService();