import { prisma } from "~/lib/prisma";
import type { CreateBookDto } from "~/dtos/create-book-dto";
import ApiError from "~/exceptions/api-error";
import { initFb2File } from "@lingo-reader/fb2-parser";
import manageBookService from "../manageBook/manageBook-service";
import { storageService } from "~/storage";
import fs from "fs/promises";
import os from "os";
import path from "path";

class ImportBookService {

  async importFB2(fileBuffer: Buffer, userId: string, genreId: string) {
    const resourceSaveDir = path.join(os.tmpdir(), "lectio-fb2-import");

    try {
      const fb2 = await initFb2File(fileBuffer, resourceSaveDir);

      let coverUrl: string | undefined;
      const coverPath = fb2.getCoverImage();
      if (coverPath) {
        const coverBuffer = await fs.readFile(coverPath);
        coverUrl = await storageService.saveFile(coverBuffer, path.basename(coverPath), "image/jpeg");
      }

      const metadata = fb2.getMetadata();
      const rawDescription = metadata.description;
      const description = typeof rawDescription === "string" ? rawDescription : undefined;

      const bookData: CreateBookDto = {
        title: metadata.title?.trim() || "Без названия",
        description,
        coverUrl,
        genreId,
      };
      const statusCreate = await manageBookService.addBook(userId, bookData);

      const spine = fb2.getSpine();
      if (!spine || spine.length === 0) {
        fb2.destroy();
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
        await manageBookService.addChapter(statusCreate.bookId, {
          title: `Глава ${index + 1}`,
          content: chapter.html,
        });
      }

      fb2.destroy();
      return statusCreate;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      console.error("FB2 import error:", error);
      throw ApiError.BadRequest("Не удалось импортировать FB2 файл");
    }
  }
}

export default new ImportBookService();
