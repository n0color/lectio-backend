// src/modules/support/support-service.ts
import { prisma } from "~/lib/prisma";
import ApiError from "~/exceptions/api-error";
import { SupportTicketType, SupportTicketStatus } from "../../../generated/prisma/enums";

interface CreateTicketData {
  type: SupportTicketType;
  message: string;
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
}

export default new SupportService();