export interface CreateChapterDto {
  title: string;
  content: string;
}

export interface CreateBookDto {
  title: string;
  description?: string;
  authorId: string;
  secondAuthorId?: string;
  coverUrl?: string;
  chapters?: CreateChapterDto[];
}