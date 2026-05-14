// src/types/books.ts
export interface BookWithChaptersResponse {
  id: string;
  title: string;
  description: string | null;
  coverUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
  avgRating: number | null;
  reviewsCount: number | null;
  likes: number;
  genre: { id: string; name: string } | null;
  author: { nickname: string | null } | null;
  coAuthor: { nickname: string | null } | null;
  tags: { id: string; name: string }[];
  chapters: {
    id: string;
    chapterNumber: number;
    title: string;
    createdAt: Date;
  }[];
}

export interface ChapterResponse {
  id: string;
  bookId: string;
  chapterNumber: number;
  title: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}