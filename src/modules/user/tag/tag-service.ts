import { prisma } from "~/lib/prisma";
import ApiError from "~/exceptions/api-error";

class TagService {
  async searchTags(query?: string, limit = 30) {
    const trimmed = query?.trim();

    return prisma.tag.findMany({
      where: trimmed
        ? { name: { contains: trimmed, mode: "insensitive" } }
        : undefined,
      take: limit,
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    });
  }

  async createTag(userId: string, name: string) {
    const normalized = name.trim();

    if (!normalized) {
      throw ApiError.BadRequest("Название тега не может быть пустым");
    }

    if (normalized.length > 100) {
      throw ApiError.BadRequest("Название тега не должно превышать 100 символов");
    }

    const existing = await prisma.tag.findFirst({
      where: { name: { equals: normalized, mode: "insensitive" } },
      select: { id: true, name: true },
    });

    if (existing) {
      return existing;
    }

    return prisma.tag.create({
      data: {
        name: normalized,
        creatorId: userId,
      },
      select: { id: true, name: true },
    });
  }
}

export default new TagService();
