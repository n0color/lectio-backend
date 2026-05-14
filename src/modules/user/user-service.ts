import { error } from "console";
import { prisma } from "~/lib/prisma";
import ApiError from "~/exceptions/api-error";
import { FriendshipStatus } from "../../../generated/prisma/enums";

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

    async getPublicProfile(userId: string) {
    return prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        login: true,
        nickname: true,
        avatar: true,
        role: true,
      },
    });
  }

  // Список друзей пользователя (с полной информацией о друзьях, статус ACCEPTED)
  async getFriends(userId: string, page: number = 1, limit: number = 20): Promise<[any[], number]> {
    const skip = (page - 1) * limit;
    const whereFriends = {
      OR: [
        { senderId: userId, status: FriendshipStatus.ACCEPTED },
        { receiverId: userId, status: FriendshipStatus.ACCEPTED },
      ],
    };

    const [friendships, total] = await prisma.$transaction([
      prisma.friendship.findMany({
        where: whereFriends,
        skip,
        take: limit,
        include: {
          sender: {
            select: { id: true, login: true, nickname: true, avatar: true },
          },
          receiver: {
            select: { id: true, login: true, nickname: true, avatar: true },
          },
        },
        orderBy: { updatedAt: 'desc' },
      }),
      prisma.friendship.count({ where: whereFriends }),
    ]);

    const friends = friendships.map(f => 
      f.senderId === userId ? f.receiver : f.sender
    );
    return [friends, total];
  }

  async getSentRequests(userId: string, page: number = 1, limit: number = 20): Promise<[any[], number]> {
    const skip = (page - 1) * limit;
    const where = { senderId: userId, status: FriendshipStatus.PENDING };
    const [requests, total] = await prisma.$transaction([
      prisma.friendship.findMany({
        where,
        skip,
        take: limit,
        include: {
          receiver: {
            select: { id: true, login: true, nickname: true, avatar: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.friendship.count({ where }),
    ]);
    return [requests, total];
  }

  async getReceivedRequests(userId: string, page: number = 1, limit: number = 20): Promise<[any[], number]> {
    const skip = (page - 1) * limit;
    const where = { receiverId: userId, status: FriendshipStatus.PENDING };
    const [requests, total] = await prisma.$transaction([
      prisma.friendship.findMany({
        where,
        skip,
        take: limit,
        include: {
          sender: {
            select: { id: true, login: true, nickname: true, avatar: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.friendship.count({ where }),
    ]);
    return [requests, total];
  }

  // Отправить заявку в друзья
  async sendFriendRequest(senderId: string, receiverId: string) {
    // Проверки: нельзя себе, нельзя если уже есть запись (любой статус)
    if (senderId === receiverId) {
      throw new Error("Cannot send friend request to yourself");
    }
    const existing = await prisma.friendship.findUnique({
      where: {
        senderId_receiverId: {
          senderId,
          receiverId,
        },
      },
    });
    if (existing) {
      if (existing.status === FriendshipStatus.ACCEPTED) {
        throw new Error("Already friends");
      }
      if (existing.status === FriendshipStatus.PENDING) {
        throw new Error("Friend request already sent");
      }
      if (existing.status === FriendshipStatus.BLOCKED) {
        throw new Error("User blocked");
      }
    }
    // Проверка обратной пары (receiverId, senderId)
    const reverse = await prisma.friendship.findUnique({
      where: {
        senderId_receiverId: {
          senderId: receiverId,
          receiverId: senderId,
        },
      },
    });
    if (reverse) {
      if (reverse.status === FriendshipStatus.ACCEPTED) {
        throw new Error("Already friends");
      }
      if (reverse.status === FriendshipStatus.PENDING) {
        throw new Error("User already sent you a request");
      }
      if (reverse.status === FriendshipStatus.BLOCKED) {
        throw new Error("You are blocked");
      }
    }
    return prisma.friendship.create({
      data: {
        senderId,
        receiverId,
        status: FriendshipStatus.PENDING,
      },
      include: {
        receiver: {
          select: { id: true, login: true, nickname: true, avatar: true },
        },
      },
    });
  }

  // Принять заявку (только если статус PENDING и текущий пользователь receiver)
  async acceptFriendRequest(userId: string, requestId: string) {
    const request = await prisma.friendship.findFirst({
      where: {
        id: requestId,
        receiverId: userId,
        status: FriendshipStatus.PENDING,
      },
    });
    if (!request) {
      throw new Error("Friend request not found or not pending");
    }
    return prisma.friendship.update({
      where: { id: requestId },
      data: { status: FriendshipStatus.ACCEPTED },
    });
  }

  // Отклонить заявку (удалить)
  async declineFriendRequest(userId: string, requestId: string) {
    const request = await prisma.friendship.findFirst({
      where: {
        id: requestId,
        receiverId: userId,
        status: FriendshipStatus.PENDING,
      },
    });
    if (!request) {
      throw new Error("Friend request not found or not pending");
    }
    return prisma.friendship.delete({ where: { id: requestId } });
  }

  // Удалить из друзей (если статус ACCEPTED)
  async removeFriend(userId: string, friendId: string) {
    const friendship = await prisma.friendship.findFirst({
      where: {
        OR: [
          { senderId: userId, receiverId: friendId, status: FriendshipStatus.ACCEPTED },
          { senderId: friendId, receiverId: userId, status: FriendshipStatus.ACCEPTED },
        ],
      },
    });
    if (!friendship) {
      throw new Error("Friendship not found");
    }
    return prisma.friendship.delete({ where: { id: friendship.id } });
  }

  // Отменить отправленную заявку (если статус PENDING и senderId = userId)
  async cancelFriendRequest(userId: string, requestId: string) {
    const request = await prisma.friendship.findFirst({
      where: {
        id: requestId,
        senderId: userId,
        status: FriendshipStatus.PENDING,
      },
    });
    if (!request) {
      throw new Error("Friend request not found");
    }
    return prisma.friendship.delete({ where: { id: requestId } });
  }

}

export default new UserService();