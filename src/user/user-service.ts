import { error } from "console";
import { prisma } from "~/lib/prisma";
import ApiError from "~/exceptions/api-error";

class UserService {

  async activate(activationLink: string) {
    const user = await prisma.user.findUnique({
      where: {
        actLink: activationLink,
      }
    });
    if (!user) {
      throw ApiError.BadRequest('Пользователь с таким идентификатором не существует');
    }
    await prisma.user.update({
      where: { id: user.id },
      data: {isActivated: true},
    });
  }
  async getAllUsers() {
    const users = await prisma.user.findMany();
    const tokens = await prisma.token.findMany();
    const data = [users, tokens] 
    return data;
  }

}

export default new UserService();