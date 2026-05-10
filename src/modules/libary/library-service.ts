import { prisma } from "~/lib/prisma";
import { BookStatus } from "../../../generated/prisma/enums";

interface AddBookData {
  bookId: string;
  status?: BookStatus;
  ownNote?: string;
}

interface UpdateBookData {
  status?: BookStatus;
  ownNote?: string;
}

interface GetBooksFilters {
  status?: BookStatus;
  page?: number;
  limit?: number;
}

class LibraryService {
  // Получить все книги пользователя с фильтром по статусу
  async getUserBooks(userId: string, filters: GetBooksFilters): Promise<[any[], number]> {
    const page = filters.page || 1;
    const limit = filters.limit || 20;
    const skip = (page - 1) * limit;

    const where: any = { userId };

    if (filters.status) {
      where.status = filters.status;
    }

    const [books, total] = await prisma.$transaction([
      prisma.userBook.findMany({
        skip,
        take: limit,
        where,
        include: {
          book: {
            select: {
              id: true,
              title: true,
              description: true,
              coverUrl: true,
            },
          },
        },
        orderBy: { updatedAt: 'desc' },
      }),
      prisma.userBook.count({ where }),
    ]);

    return [books, total];
  }

  async getUserBook(userId: string, bookId: string): Promise<any | null> {
    return prisma.userBook.findUnique({
      where: {
        userId_bookId: { userId, bookId },
      },
      include: {
        book: {
          select: {
            id: true,
            title: true,
            description: true,
          },
        },
      },
    });
  }

  // Добавить книгу в библиотеку пользователя
  async addBook(userId: string, data: AddBookData): Promise<any> {
    return prisma.userBook.create({
      data: {
        userId,
        bookId: data.bookId,
        status: data.status || 'WANT_TO_READ',
        ownNote: data.ownNote,
      },
      include: {
        book: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });
  }

  // Обновить статус и/или заметку
  async updateBook(userId: string, bookId: string, data: UpdateBookData): Promise<any> {
    return prisma.userBook.update({
      where: {
        userId_bookId: { userId, bookId },
      },
      data: {
        status: data.status,
        ownNote: data.ownNote,
      },
      include: {
        book: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });
  }

  // Удалить книгу из библиотеки
  async removeBook(userId: string, bookId: string): Promise<any> {
    return prisma.userBook.delete({
      where: {
        userId_bookId: { userId, bookId },
      },
    });
  }
}

export default new LibraryService();