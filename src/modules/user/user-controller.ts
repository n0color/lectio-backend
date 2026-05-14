import type { Request, Response, NextFunction } from 'express'
import userService from './user-service';
import ApiError from '~/exceptions/api-error';

export class UserController {

  async activate(req: Request, res: Response, next: NextFunction) {
    try {
      const { link } = req.params;
      if (!link || typeof link !== 'string') {
        throw new Error("Ссылка на активацию отсутсвует или некорректна");
      }
      console.log(link);
      await userService.activate(link);
      if (process.env.CLIENT_URL) return res.redirect(process.env.CLIENT_URL);
      else  { 
        console.log("Не задан URL клиента!"); 
        throw ApiError.InternalError('Ошибка на сервере, сообщите администратору!');
      }
    } catch (error) {
      next(error);
    }
  }
  async getPublicProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      if (!id || typeof id !== 'string') {
        return res.status(400).json({ error: 'Invalid user id' });
      }
      const profile = await userService.getPublicProfile(id);
      if (!profile) {
        return res.status(404).json({ error: 'User not found' });
      }
      return res.json({ data: profile });
    } catch (error) {
      next(error);
    }
  }

  // GET /user/friends?page=1&limit=20
  async getFriends(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const [friends, total] = await userService.getFriends(userId, page, limit);
      return res.json({
        data: friends,
        meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
      });
    } catch (error) {
      next(error);
    }
  }

  // GET /user/friend-requests/sent
  async getSentRequests(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) return res.status(401).json({ error: 'Unauthorized' });
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const [requests, total] = await userService.getSentRequests(userId, page, limit);
      return res.json({
        data: requests,
        meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
      });
    } catch (error) {
      next(error);
    }
  }

  // GET /user/friend-requests/received
  async getReceivedRequests(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) return res.status(401).json({ error: 'Unauthorized' });
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const [requests, total] = await userService.getReceivedRequests(userId, page, limit);
      return res.json({
        data: requests,
        meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
      });
    } catch (error) {
      next(error);
    }
  }

  // POST /user/friend-requests
  async sendFriendRequest(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) return res.status(401).json({ error: 'Unauthorized' });
      const { receiverId } = req.body;
      if (!receiverId || typeof receiverId !== 'string') {
        return res.status(400).json({ error: 'Missing or invalid receiverId' });
      }
      const result = await userService.sendFriendRequest(userId, receiverId);
      return res.status(201).json({ data: result });
    } catch (error: any) {
      if (error.message === 'Cannot send friend request to yourself' ||
          error.message === 'Already friends' ||
          error.message === 'Friend request already sent' ||
          error.message === 'User already sent you a request' ||
          error.message === 'User blocked' ||
          error.message === 'You are blocked') {
        return res.status(409).json({ error: error.message });
      }
      next(error);
    }
  }

  // POST /user/friend-requests/:requestId/accept
  async acceptFriendRequest(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) return res.status(401).json({ error: 'Unauthorized' });
      const { requestId } = req.params;
      if (!requestId || typeof requestId !== 'string') {
        return res.status(400).json({ error: 'Invalid requestId' });
      }
      const result = await userService.acceptFriendRequest(userId, requestId);
      return res.json({ data: result });
    } catch (error: any) {
      if (error.message === 'Friend request not found or not pending') {
        return res.status(404).json({ error: error.message });
      }
      next(error);
    }
  }

  // DELETE /user/friend-requests/:requestId/decline
  async declineFriendRequest(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) return res.status(401).json({ error: 'Unauthorized' });
      const { requestId } = req.params;
      if (!requestId || typeof requestId !== 'string') {
        return res.status(400).json({ error: 'Invalid requestId' });
      }
      await userService.declineFriendRequest(userId, requestId);
      return res.status(204).send();
    } catch (error: any) {
      if (error.message === 'Friend request not found or not pending') {
        return res.status(404).json({ error: error.message });
      }
      next(error);
    }
  }

  // DELETE /user/friends/:friendId
  async removeFriend(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) return res.status(401).json({ error: 'Unauthorized' });
      const { friendId } = req.params;
      if (!friendId || typeof friendId !== 'string') {
        return res.status(400).json({ error: 'Invalid friendId' });
      }
      await userService.removeFriend(userId, friendId);
      return res.status(204).send();
    } catch (error: any) {
      if (error.message === 'Friendship not found') {
        return res.status(404).json({ error: error.message });
      }
      next(error);
    }
  }

  // DELETE /user/friend-requests/sent/:requestId
  async cancelFriendRequest(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) return res.status(401).json({ error: 'Unauthorized' });
      const { requestId } = req.params;
      if (!requestId || typeof requestId !== 'string') {
        return res.status(400).json({ error: 'Invalid requestId' });
      }
      await userService.cancelFriendRequest(userId, requestId);
      return res.status(204).send();
    } catch (error: any) {
      if (error.message === 'Friend request not found') {
        return res.status(404).json({ error: error.message });
      }
      next(error);
    }
  }

}
