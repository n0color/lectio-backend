import { prisma } from '~/lib/prisma';
import { bookCardSelect, mapBookCard } from '~/lib/book-helpers';


class RecService {

  async betaRecommendations() {
    const randomIds = await prisma.$queryRaw<Array<{ id: string }>>`
      SELECT b.id
      FROM books b
      WHERE b."isApproved" = true
      ORDER BY random()
      LIMIT 10
    `;

    if (randomIds.length === 0) {
      return [];
    }

    const books = await prisma.book.findMany({
      where: { id: { in: randomIds.map((book) => book.id) } },
      select: bookCardSelect,
    });

    const orderMap = new Map(randomIds.map((book, index) => [book.id, index]));
    return books
      .sort((a, b) => (orderMap.get(a.id) ?? 0) - (orderMap.get(b.id) ?? 0))
      .map(mapBookCard);
  }

  async newestRecommendations() {
    const newestBooks = await prisma.book.findMany({
      where: { isApproved: true },
      take: 10,
      orderBy: { createdAt: 'desc' },
      select: bookCardSelect,
    });

    return newestBooks.map(mapBookCard);
  }

  async likestRecommendations() {
    const likestBooks = await prisma.book.findMany({
      where: { isApproved: true },
      take: 10,
      orderBy: { reviewsCount: 'desc' },
      select: bookCardSelect,
    });

    return likestBooks.map(mapBookCard);
  }

  async genres() {
    return prisma.genre.findMany({
      orderBy: { name: 'asc' },
      select: {
        id: true,
        name: true,
      },
    });
  }
}

export default new RecService();
