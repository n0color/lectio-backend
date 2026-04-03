import { prisma } from "~/lib/prisma";
import type { CreateBookDto, CreateChapterDto } from "~/dtos/create-book-dto";
import ApiError from "~/exceptions/api-error";
import { initFb2File, type Fb2File } from "@lingo-reader/fb2-parser";
import manageBookService from "../manageBook/manageBook-service";
class ImportBookService {

  async importFB2(fileBuffer: Buffer, userId: string) {
    let fb2: Fb2File;
    try {
      fb2 = await initFb2File(fileBuffer);
    } catch (error) {
      throw ApiError.BadRequest('Не удалось разобрать FB2 файл. Возможно он повреждён');
    }

    const metadata = fb2.getMetadata()
    const title = metadata.title;
    const description = metadata.description;

    const bookData: CreateBookDto = {
      title: title || 'Без названия',
      description,
      coverUrl: undefined,
      secondAuthorId: undefined,
      authorId: userId,
    }
    const statusCreate = await manageBookService.addBook(userId, bookData);

    const spine = fb2.getSpine();
    if (!spine || spine.length === 0) {
      return statusCreate;
    }

    const chaptersCreate: CreateChapterDto[] = [];
    for (let index = 0; index < spine.length; index++) {
      const chapterId = spine[index]?.id;
      if (!chapterId) {
        continue;
      }
      const chapter = fb2.loadChapter(chapterId);
      if (!chapter) {
        continue;
      }
      const chapterHtml = chapter.html;
      let chapterTitle = `Глава ${index + 1}`;
      await manageBookService.addChapter(statusCreate.bookId, {
        title: chapterTitle,
        content: chapterHtml,
      });
    }
    fb2.destroy();
    return statusCreate;
  }
}

export default new ImportBookService();