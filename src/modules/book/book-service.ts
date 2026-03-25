import { prisma } from "~/lib/prisma";
import type { CreateBookDto, CreateChapterDto } from "~/dtos/create-book-dto";
import ApiError from "~/exceptions/api-error";

class BookService {
  async createBook(userId: string, data: CreateBookDto) {
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
        author: true,
        coAuthor: true,
      }
    });

    return book;
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

    return { status: true, message: `Глава ${nextNumber} успешно добавлена!` }
  }
}

export default new BookService();