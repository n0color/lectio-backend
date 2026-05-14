import { prisma } from "~/lib/prisma";
import type { CreateBookDto, CreateChapterDto } from "~/dtos/create-book-dto";
import ApiError from "~/exceptions/api-error";
import type { Fb2File, Fb2Resource } from "@lingo-reader/fb2-parser"; // только типы
import manageBookService from "../manageBook/manageBook-service";
import { storageService } from "~/storage";

class ImportBookService {

  async importFB2(fileBuffer: Buffer, userId: string) {
    // Динамический импорт ESM-модуля внутри CommonJS
    const { initFb2File } = await import("@lingo-reader/fb2-parser");

    let fb2: Fb2File;
    try {
      fb2 = await initFb2File(fileBuffer);
    } catch (error) {
      throw ApiError.BadRequest('Не удалось разобрать FB2 файл. Возможно он повреждён');
    }

    let coverUrl: string | undefined = undefined;
    const coverBuffer = this.extractCoverImage(fb2);
    if (coverBuffer) {
      coverUrl = await storageService.saveFile(coverBuffer, 'cover.jpg', 'image/jpeg');
    }

    const metadata = fb2.getMetadata()
    const title = metadata.title;
    const description = metadata.description;

    const bookData: CreateBookDto = {
      title: title || 'Без названия',
      description,
      coverUrl: coverUrl,
      secondAuthorId: undefined,
      authorId: userId,
    }
    const statusCreate = await manageBookService.addBook(userId, bookData);

    const spine = fb2.getSpine();
    if (!spine || spine.length === 0) {
      return statusCreate;
    }
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

  private extractCoverImage(fb2: any): Buffer | null {
    if (!fb2.resources || !Array.isArray(fb2.resources)) return null;

    const coverResource = fb2.resources.find((res: Fb2Resource) => {
      const id = res.id?.toLowerCase();
      return id === 'cover.jpg' || id === 'cover.jpeg' || id === 'cover.png' || id === 'cover';
    });

    if (coverResource && coverResource.data) {
      return coverResource.data;
    }

    return null;
  }
}

export default new ImportBookService();