import type { Prisma } from "../../generated/prisma/client";

export const MAX_BOOK_TAGS = 3;

export const bookCardSelect = {
  id: true,
  title: true,
  coverUrl: true,
  description: true,
  createdAt: true,
  genre: {
    select: { id: true, name: true },
  },
  author: {
    select: { nickname: true },
  },
  tags: {
    select: {
      tag: {
        select: { id: true, name: true },
      },
    },
  },
} satisfies Prisma.bookSelect;

type BookWithNestedTags = Prisma.bookGetPayload<{ select: typeof bookCardSelect }>;

export type BookCardItem = {
  id: string;
  title: string;
  coverUrl: string | null;
  description: string | null;
  createdAt: Date;
  author: { nickname: string } | null;
  genre: { id: string; name: string } | null;
  tags: { id: string; name: string }[];
};

export function mapBookCard(book: BookWithNestedTags): BookCardItem {
  return {
    id: book.id,
    title: book.title,
    coverUrl: book.coverUrl,
    description: book.description,
    createdAt: book.createdAt,
    author: book.author,
    genre: book.genre,
    tags: book.tags.map((bt) => bt.tag),
  };
}
