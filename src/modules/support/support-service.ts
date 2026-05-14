// src/modules/support/support-service.ts
import { prisma } from "~/lib/prisma";
import ApiError from "~/exceptions/api-error";
import { SupportTicketType, SupportTicketStatus } from "../../../generated/prisma/enums";

interface CreateTicketData {
  type: SupportTicketType;
  message: string;
}

interface GetUserTicketsParams {
  userId: string;
  page?: number;
  limit?: number;
}

class SupportService {
  // Создание нового тикета
  async createTicket(userId: string, data: CreateTicketData) {
    // проверяем, что тип валидный (express-validator уже должен проверить, но дополнительно)
    if (!Object.values(SupportTicketType).includes(data.type)) {
      throw ApiError.BadRequest("Invalid ticket type");
    }

    const ticket = await prisma.supportTicket.create({
      data: {
        userId,
        type: data.type,
        message: data.message,
        status: SupportTicketStatus.OPEN,
      },
      include: {
        user: {
          select: {
            id: true,
            login: true,
            email: true,
          },
        },
      },
    });

    return ticket;
  }

  async getUserTickets(params: GetUserTicketsParams) {
    const page = params.page ?? 1;
    const limit = Math.min(params.limit ?? 20, 100);
    const skip = (page - 1) * limit;
    const userId = params.userId;

    const [tickets, total] = await prisma.$transaction([
      prisma.supportTicket.findMany({
        where: { userId },
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          user: {
            select: { id: true, login: true, email: true },
          },
        },
      }),
      prisma.supportTicket.count({ where: { userId } }),
    ]);

    return { tickets, total };
  }

  async getTicketById(id: string, userId: string, isAdmin: boolean) {
    const ticket = await prisma.supportTicket.findFirst({
      where: isAdmin ? { id } : { id, userId },
      include: {
        user: {
          select: { id: true, login: true, email: true },
        },
      },
    });

    if (!ticket) {
      throw ApiError.NotFound("Тикет не найден");
    }

    return ticket;
  }
}

export default new SupportService();