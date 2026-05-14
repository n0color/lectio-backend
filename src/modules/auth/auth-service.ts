import { prisma } from "~/lib/prisma";
import { nanoid } from "nanoid";

import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

import mailService from "~/modules/user/mail/mail-service";
import UserDto from "~/dtos/user-dto";
import ApiError from "~/exceptions/api-error";

class AuthService {

  async registration(email: string, password: string, login: string,  nickname: string, userAgent?: string,) {
    const candidate = await prisma.user.findFirst({
        where: {
          OR: [
            {email: email},
            {login: login},
          ]
        }
      });
    if (candidate) {
      throw ApiError.BadRequest(`Пользователь с email ${email} или логином ${login} уже существует`)
    }
    const hashPassword = await bcrypt.hash(password, 4);
    const activationLink = nanoid(15);
    const user = await prisma.user.create({
      data: {
        login: login,
        email: email,
        nickname: nickname,
        password: hashPassword,
        actLink: activationLink,
      }
    });
    // await mailService.sendActivationMail(email, activationLink);
    const userDto = new UserDto(user);
    const tokens = this.generateTokens({...userDto});
    await this.saveToken(userDto.id, tokens.refreshToken, userAgent);
    return {
      ...tokens,
      user: userDto
      }
    }

    generateTokens(payload: object) {
      if (!payload || Object.keys(payload).length === 0) {
        throw ApiError.BadRequest('Payload cannot be empty');
      }
      const secretAccess = process.env.JWT_ACCESS_SECRET;
      const secretRefresh = process.env.JWT_REFRESH_SECRET;

      if (!secretAccess || !secretRefresh) {
        throw ApiError.InternalError('JWT Модули не были сконфигурированы');
      }
      try {
        const accessToken = jwt.sign(payload, secretAccess, { expiresIn: '45m' });
        const refreshToken = jwt.sign(payload, secretRefresh, { expiresIn: '30d' });
        
        return { refreshToken, accessToken };
      } catch (error) {
        console.error('Ошибка при генерации токена:', error);
        // 500 Internal Server Error - ошибка при создании токена
        throw ApiError.InternalError('Ошибка при генерации токена');
      }
    }

    async saveToken(userId: string, refreshToken: string, userAgent?: string) {
      try {
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 30);
    
        // Пытаемся найти существующий токен пользователя
        const existingToken = await prisma.token.findFirst({
          where: { userId: userId }
        });
    
        if (existingToken) {
          // Обновляем существующий токен
          const token = await prisma.token.update({
            where: { id: existingToken.id },
            data: {
              refreshToken,
              userAgent,
              expiresAt
            }
          });
          return token;
        } else {
          // Создаём новый, если нет существующего
          const token = await prisma.token.create({
            data: {
              userId: userId,
              refreshToken,
              userAgent,
              expiresAt
            }
          });
          return token;
        }
      } catch (error) {
        console.error('Ошибка при сохранении токена:', error);
        throw ApiError.InternalError('Ошибка при сохранении токена');
      }
    }

    async login(password: string, login: string, userAgent?: string) {
      const user = await prisma.user.findFirst({
        where: {
          OR: [
            {email: login},
            {login: login},
          ]
        }
      }); 
      if (!user) {
        throw ApiError.BadRequest("Пользователь не был найден!");
      }
      const isPassEquals = await bcrypt.compare(password, user.password);
      if (!isPassEquals) {
        throw ApiError.BadRequest("Неверный пароль");
      }
      const userDto = new UserDto(user);
      const tokens = this.generateTokens({...userDto});
      await this.saveToken(userDto.id, tokens.refreshToken, userAgent);
      return {
        ...tokens,
        user: userDto
      }
    }
    async logout(refreshToken: string) {
      const token = await prisma.token.findFirst({
        where: { refreshToken: refreshToken }
      });
      if (!token) {
        return { message: 'Already logged out' };
      }
      await prisma.token.delete({
        where: { id: token.id }
      });
      return { message:"Вы вышли из аккаунта" };
    }
    validateAccessToken(token:string) {
      try {
        const secretAccess = process.env.JWT_ACCESS_SECRET;
        if (!secretAccess) {
          throw ApiError.InternalError('JWT Модули не были сконфигурированы');
        }
        const userData = jwt.verify(token, secretAccess);
        return userData;
      } catch (error) {
        return null;
      }
    }

    validatRefreshToken(token:string) {
      try {
        const secretRefresh = process.env.JWT_REFRESH_SECRET;
        if (!secretRefresh) {
          throw ApiError.InternalError('JWT Модули не были сконфигурированы');
        }
        const userData = jwt.verify(token, secretRefresh);
        return userData;
      } catch (error) {
        return null;
      }
    }

    async refresh(refreshToken: string) {

      if (!refreshToken) {
        console.log('❌ Токен отсутствует');
        throw ApiError.UnauthorizedError();
      }
      
      const userData = this.validatRefreshToken(refreshToken);
      
      if (!userData || typeof userData === 'string') {
        console.log('❌ Токен не прошел валидацию');
        throw ApiError.UnauthorizedError();
      }
      const tokenData = await prisma.token.findUnique({
        where: { refreshToken }
      });
      
      if (!tokenData) {
        console.log('❌ Токен не найден в БД');
        throw ApiError.UnauthorizedError();
      }
      
      const user = await prisma.user.findUnique({
        where: { id: userData.id }
      });
      
      if (!user) {
        console.log('❌ Пользователь не найден');
        throw ApiError.UnauthorizedError();
      }
      const userDto = new UserDto(user);
      const tokens = this.generateTokens({...userDto});
      await this.saveToken(userDto.id, tokens.refreshToken, tokenData.userAgent ?? undefined);

      return {
        ...tokens,
        user: userDto
      };
    }
    


}

export default new AuthService;