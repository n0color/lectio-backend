import { prisma } from "~/lib/prisma";
import ApiError from "~/exceptions/api-error";
import type { UserList } from "~/types/userList";

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

}

export default new AdminService();