import { prisma } from "~/lib/prisma";
import type { CreateBookDto, CreateChapterDto } from "~/dtos/create-book-dto";
import ApiError from "~/exceptions/api-error";
import { storageService } from "~/storage";

class ManageBookService {

  async getUserBooks(userId: string, page: number = 1, perPage: number = 20) {
    const skip = (page - 1) * perPage;
    const where = {
      OR: [
        { authorId: userId },
        { coAuthorId: userId }
      ]
    };
    const [items, total] = await Promise.all([
      prisma.book.findMany({
        where,
        select: {
          id: true,
          title: true,
          coverUrl: true,
          description: true,
          isApproved: true,
          createdAt: true,
          updatedAt: true,
          author: {
            select: { nickname: true }
          },
          coAuthor: {
            select: { nickname: true }
          },
          _count: { select: { chapters: true } }
        },
        skip,
        take: perPage,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.book.count({ where })
    ]);
    return {
      items,
      total,
      page,
      perPage,
      totalPages: Math.ceil(total / perPage)
    };
  }

  async getBookById(bookId: string) {
    const book = await prisma.book.findUnique({
      where: { id: bookId },
      include: {
        author: { select: { id: true, login: true, nickname: true, email: true } },
        coAuthor: { select: { id: true, login: true, nickname: true, email: true } },
        chapters: {
          orderBy: { chapterNumber: 'asc' },
          select: { id: true, chapterNumber: true, title: true, createdAt: true, updatedAt: true }
        }
      }
    });
    if (!book) throw ApiError.NotFound('Книга не найдена');
    return book;
  }

  async getChapterById(chapterId: string, userId: string) {
    // Получаем главу вместе с данными о книге
    const chapter = await prisma.chapter.findUnique({
      where: { id: chapterId },
    });
  
    if (!chapter) {
      throw ApiError.NotFound('Глава не найдена');
    }
    return chapter;
  }

  async addBook(userId: string, data: CreateBookDto) {
    const authorId = userId;
    const authorExists = await prisma.user.findUnique({
      where: { id: authorId }
    });
    if (!authorExists) {
      throw ApiError.BadRequest('Автор не найден');
    }
    if (data.secondAuthorId) {
      const secondAuthorExists = await prisma.user.findUnique({
        where: { id: data.secondAuthorId }
      })
      if (!secondAuthorExists) {
        throw ApiError.BadRequest('Второй автор не найден');
      }
    }
    const book = await prisma.book.create({
      data: {
        title: data.title,
        description: data.description,
        authorId,
        coAuthorId: data.secondAuthorId,
        coverUrl: data.coverUrl,
        isApproved: true, //заглушка для dev
      },
      include: {
        chapters: true,
      }
    });

    return { status: true, bookId: book.id, message: `Книга ${book.title} успешно добавлена!` }
  }

  async updateBook(bookId: string, userId: string, data: any) {
    const book = await prisma.book.findUnique({
      where: {id: bookId},
      select: {authorId: true, coAuthorId: true }
    });
    if (!book) throw ApiError.NotFound('Книга не найдена');

    if  (book.authorId !== userId && book.coAuthorId !== userId) {
      throw ApiError.Forbidden('У вас нет прав на редактирование книги!');
    }

    if (data.coAuthorId) {
      const secondAuthor = await prisma.user.findUnique({
        where: { id: data.coAuthorId }
      });
      if (!secondAuthor) throw ApiError.BadRequest('Соавтор не найден');
    }
    const updatedBook = await prisma.book.update({
      where: { id: bookId },
      data: {
        title: data.title,
        description: data.description,
        coverUrl: data.coverUrl,
        coAuthorId: data.coAuthorId,
      },
      include: { author: true, coAuthor: true }
    });
    return { status: true, bookId: updatedBook.id, message: `Книга ${updatedBook.title} успешно обновлена!` }
  }

  async deleteBook(bookId: string, userId: string) {
    const book = await prisma.book.findUnique({
      where: { id: bookId },
      select: { title: true, authorId: true, coAuthorId: true }
    });
    if (!book) throw ApiError.NotFound('Книга не найдена');
    if  (book.authorId !== userId && book.coAuthorId !== userId) {
      throw ApiError.Forbidden('У вас нет прав на удаление книги!');
    }
    await prisma.book.delete({where: { id: bookId }});
    return { status: true, message: `Книга ${book.title} успешно удалена!` }
  }


  async addChapter(bookId: string, data: CreateChapterDto) {
    const lastChapter = await prisma.chapter.findFirst({
      where: { bookId },
      orderBy: { chapterNumber: 'desc' },
      select: { chapterNumber: true }
    });

    const nextNumber = (lastChapter?.chapterNumber ?? 0) + 1;

    const chapter = await prisma.chapter.create({
      data: {
        bookId,
        chapterNumber: nextNumber,
        title: data.title,
        content: data.content,
      }
    });

    return { status: true, chapterId: chapter.id, message: `Глава ${nextNumber} успешно добавлена!` }
  }
  async updateChapter(chapterId: string, userId: string, data: any) {
    // Получаем книгу через главу
    const chapter = await prisma.chapter.findUnique({
      where: { id: chapterId },
      include: { book: { select: { authorId: true, coAuthorId: true } } }
    });
    if (!chapter) throw ApiError.NotFound('Глава не найдена');
  
    const book = chapter.book;
    if (book.authorId !== userId && book.coAuthorId !== userId) {
      throw ApiError.Forbidden('Нет прав на редактирование этой главы');
    }
  
    const updatedChapter = await prisma.chapter.update({
      where: { id: chapterId },
      data: {
        title: data.title,
        content: data.content,
      }
    });
    return { status: true, message: `Глава ${updatedChapter.chapterNumber} успешно обновлена!` }
  }
  async deleteChapter(chapterId: string, userId: string) {
    const chapter = await prisma.chapter.findUnique({
      where: { id: chapterId },
      include: { book: { select: { authorId: true, coAuthorId: true } } }
    });
    if (!chapter) throw ApiError.NotFound('Глава не найдена');
  
    const book = chapter.book;
    if (book.authorId !== userId && book.coAuthorId !== userId) {
      throw ApiError.Forbidden('Нет прав на удаление этой главы');
    }
  
    await prisma.chapter.delete({ where: { id: chapterId } });
    return { status: true, message: `Глава ${chapter.chapterNumber} успешно удалена!` };
  }

  async updateCover(bookId: string, userId: string, fileBuffer: Buffer, originalName: string, mimeType: string): Promise<string> {
    const book = await prisma.book.findUnique({
      where: { id: bookId },
      select: {
        id: true,
        coverUrl: true,
      },
    });
  
    if (!book) {
      throw ApiError.NotFound('Книга не найдена');
    }
  
    if (book.coverUrl) {
      await storageService.deleteFile(book.coverUrl);
    }
    const newCoverUrl = await storageService.saveFile(fileBuffer, originalName, mimeType);

    await prisma.book.update({
      where: { id: bookId },
      data: { coverUrl: newCoverUrl },
    });
  
    return newCoverUrl;
  }

}

export default new ManageBookService();