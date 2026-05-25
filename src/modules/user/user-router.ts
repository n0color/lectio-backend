import { Router } from "express";
import { UserController } from "~/modules/user/user-controller";
import authMiddleware from "~/middleware/auth-middleware";
import { manageBookRouter } from "./manageBook/manageBook-router";
import { importBookRouter } from "./importBook/importBook-router";
import { tagRouter } from "./tag/tag-router";

const userController = new UserController();

export const userRouter = Router();
userRouter.get('/profile/:id', userController.getPublicProfile);

userRouter.use(authMiddleware);
userRouter.get('/friends', userController.getFriends);
userRouter.delete('/friends/:friendId', userController.removeFriend);
userRouter.get('/friend-requests/sent', userController.getSentRequests);
userRouter.get('/friend-requests/received', userController.getReceivedRequests);
userRouter.post('/friend-requests', userController.sendFriendRequest);
userRouter.post('/friend-requests/:requestId/accept', userController.acceptFriendRequest);
userRouter.delete('/friend-requests/:requestId/decline', userController.declineFriendRequest);
userRouter.delete('/friend-requests/sent/:requestId', userController.cancelFriendRequest);
userRouter.use('/manage', manageBookRouter);
userRouter.use('/tags', tagRouter);
userRouter.use('/import', importBookRouter);