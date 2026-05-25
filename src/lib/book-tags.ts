import { prisma } from "~/lib/prisma";
import ApiError from "~/exceptions/api-error";
import { MAX_BOOK_TAGS } from "./book-helpers";

export function normalizeTagIds(tagIds?: string[]): string[] {
  if (!tagIds?.length) {
    return [];
  }
  return [...new Set(tagIds)];
}

export async function validateTagIds(tagIds: string[]): Promise<void> {
  if (tagIds.length > MAX_BOOK_TAGS) {
    throw ApiError.BadRequest(`Можно выбрать не более ${MAX_BOOK_TAGS} тегов`);
  }

  if (tagIds.length === 0) {
    return;
  }

  const count = await prisma.tag.count({
    where: { id: { in: tagIds } },
  });

  if (count !== tagIds.length) {
    throw ApiError.BadRequest("Один или несколько тегов не найдены");
  }
}

export async function syncBookTags(bookId: string, tagIds: string[]): Promise<void> {
  const uniqueTagIds = normalizeTagIds(tagIds);
  await validateTagIds(uniqueTagIds);

  await prisma.$transaction([
    prisma.bookTag.deleteMany({ where: { bookId } }),
    ...(uniqueTagIds.length > 0
      ? [
          prisma.bookTag.createMany({
            data: uniqueTagIds.map((tagId) => ({ bookId, tagId })),
          }),
        ]
      : []),
  ]);
}
