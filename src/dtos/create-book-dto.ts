export interface CreateChapterDto {
  title: string;
  content: string;
}

export interface CreateBookDto {
  title: string;
  description?: string;
  secondAuthorId?: string;
  coverUrl?: string;
  genreId: string;
  tagIds?: string[];
  chapters?: CreateChapterDto[];
}

export interface UpdateBookDto {
  title?: string;
  description?: string;
  coverUrl?: string;
  coAuthorId?: string;
  secondAuthorId?: string;
  genreId?: string;
  tagIds?: string[];
}
