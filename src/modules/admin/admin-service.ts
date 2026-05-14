import { prisma } from "~/lib/prisma";
import ApiError from "~/exceptions/api-error";
import type { UserList } from "~/types/userList";
import { SupportTicketStatus, SupportTicketType } from "../../../generated/prisma/enums";

interface GenreCreateData {
  name: string;
  description?: string;
}

interface GenreUpdateData {
  name?: string;
  description?: string;
}

interface GetTicketsFilters {
  status?: SupportTicketStatus;
  type?: SupportTicketType;
  page?: number;
  limit?: number;
}



class AdminService {

  async getAllUsers(page: number, limit: number): Promise<[UserList[], number]> {
    const skip = (page - 1) * limit;

    const [ users, total ] = await prisma.$transaction([
      prisma.user.findMany({
        skip,
        take: limit,
        orderBy: {login: 'asc'},
        select: {id: true, login: true, email: true, role: true, isActivated: true }
      }),
      prisma.user.count()
    ]);
    return [ users, total ]
  }

  async getAllBooks(page: number, limit: number): Promise<[any[], number]> {
    const skip = (page - 1) * limit;

    const [ books, total ] = await prisma.$transaction([
      prisma.book.findMany({
        skip,
        take: limit,
        orderBy: {title: 'asc'},
        select: {id: true, title: true }
      }),
      prisma.user.count()
    ]);
    return [ books, total ]
  }

  async getAllSupportTickets(filters: GetTicketsFilters): Promise<[any[], number]> {
    const page = filters.page || 1;
    const limit = filters.limit || 20;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (filters.status) {
      where.status = filters.status;
    }
    if (filters.type) {
      where.type = filters.type;
    }

    const [tickets, total] = await prisma.$transaction([
      prisma.supportTicket.findMany({
        skip,
        take: limit,
        where,
        include: {
          user: {
            select: {
              id: true,
              email: true,
              login: true, // предполагаемые поля, подставьте свои
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.supportTicket.count({ where }),
    ]);

    return [tickets, total];
  }

    async updateTicketStatus(id: string, status: SupportTicketStatus): Promise<any> {
    const data: any = { status };

    // Если статус меняется на RESOLVED или CLOSED, проставляем resolvedAt
    if (status === SupportTicketStatus.RESOLVED || status === SupportTicketStatus.CLOSED) {
      data.resolvedAt = new Date();
    } else if (status === SupportTicketStatus.OPEN || status === SupportTicketStatus.IN_PROGRESS) {
      // Если возвращаем в открытые/в работе – сбрасываем resolvedAt (опционально)
      data.resolvedAt = null;
    }

    return prisma.supportTicket.update({
      where: { id },
      data,
      include: {
        user: {
          select: { id: true, email: true },
        },
      },
    });
  }
  async getAllGenres(page: number, limit: number): Promise<[any[], number]> {
    const skip = (page - 1) * limit;

    const [genres, total] = await prisma.$transaction([
      prisma.genre.findMany({
        skip,
        take: limit,
        select: { id: true, name: true, description: true, createdAt: true, updatedAt: true },
        orderBy: { name: 'asc' }, // опционально
      }),
      prisma.genre.count(), // было user.count() – исправлено
    ]);
    return [genres, total];
  }

  // Получение одного жанра по ID
  async getGenreById(id: string): Promise<any | null> {
    return prisma.genre.findUnique({
      where: { id },
      select: { id: true, name: true, description: true, createdAt: true, updatedAt: true },
    });
  }

  // Создание нового жанра
  async createGenre(data: GenreCreateData): Promise<any> {
    return prisma.genre.create({
      data: {
        name: data.name,
        description: data.description,
      },
      select: { id: true, name: true, description: true, createdAt: true, updatedAt: true },
    });
  }

  // Обновление жанра
  async updateGenre(id: string, data: GenreUpdateData): Promise<any> {
    return prisma.genre.update({
      where: { id },
      data: {
        name: data.name,
        description: data.description,
      },
      select: { id: true, name: true, description: true, updatedAt: true },
    });
  }

  // Удаление жанра (при связи books – foreign key установится в NULL)
  async deleteGenre(id: string): Promise<any> {
    return prisma.genre.delete({
      where: { id },
    });
  }

  async getBookById(id: string): Promise<any> {
    const book = await prisma.book.findFirst({
      where: {
        id: id,
      },
      select: {id: true, title: true }
    });
    return book;
  }

}

export default new AdminService();