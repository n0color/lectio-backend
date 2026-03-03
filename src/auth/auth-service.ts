import { prisma } from "~/lib/prisma";
import { nanoid } from "nanoid";

import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

import mailService from "~/mail/mail-service";
import UserDto from "~/dtos/user-dto";

class AuthService {

  async registration(email: string, password: string, login: string, userAgent?: string) {
    const candidate = await prisma.user.findFirst({
        where: {
          OR: [
            {email: email},
            {login: login},
          ]
        }
      });
    if (candidate) {
      throw new Error(`Пользователь с email ${email} или логином ${login} уже существует`)
    }
    const hashPassword = await bcrypt.hash(password, 4);
    const activationLink = nanoid(15);
    const user = await prisma.user.create({
      data: {
        login: login,
        email: email,
        password: hashPassword,
        actLink: activationLink,
      }
    });
    // await mailService.sendActivationMail(email, activationLink);
    const userDto = new UserDto(user); // id, email, isActive
    const tokens = this.generateTokens({...userDto});
    await this.saveToken(userDto.id, tokens.refreshToken, userAgent);
    return {
      ...tokens,
      user: userDto
    }
    }

    generateTokens(payload: object) {
      if (!payload || Object.keys(payload).length === 0) {
        throw new Error('Payload cannot be empty')
      }
      const secretAccess = process.env.JWT_ACCESS_SECRET;
      const secretRefresh = process.env.JWT_REFRESH_SECRET;

      if (!secretAccess || !secretRefresh) {
        throw new Error('Secrets cannot be empty')
      }
      const accessToken = jwt.sign(
        payload, 
        secretAccess,
        {
          expiresIn: '45m',
        }
      )
      const refreshToken = jwt.sign(
        payload, 
        secretRefresh,
        {
          expiresIn: '30d',
        }
      )
      return { refreshToken, accessToken }
    }

    async saveToken(userId: number, refreshToken: string, userAgent?: string) {
      
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 30); // +30 дней

      const token = await prisma.token.create({
        data: {
          user_id: userId,
          refreshToken,
          userAgent,
          expiresAt
        }
      });
      return token;
    }
}

export default new AuthService;