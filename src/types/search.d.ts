export interface SearchUsersQuery {
  q: string;
  limit?: number;   // по умолчанию 5
  offset?: number;  // по умолчанию 0
}

export interface SearchBooksQuery {
  q: string;
  page?: number;     // по умолчанию 1
  perPage?: number;  // по умолчанию 20
}

export interface SearchUsersResponse {
  items: UserSearchItem[];
  total: number;
  hasMore: boolean;
  nextOffset: number;
}

export interface SearchBooksResponse {
  items: BookSearchItem[];
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
}

export interface UserSearchItem {
  nickname: string | null;
  avatarUrl?: string | null; // если есть
}

export interface BookSearchItem {
  title: string;
  coverUrl: string | null;
  description: string | null;
  author: {
    nickname: string | null;
  } | null;
  createdAt: Date;
}