import type { BookCardItem } from "~/lib/book-helpers";

export interface SearchUsersQuery {
  q: string;
  limit?: number;
  offset?: number;
}

export interface SearchBooksQuery {
  q: string;
  page?: number;
  perPage?: number;
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
  id: string;
  login: string;
  nickname: string | null;
  avatar?: string | null;
}

export type BookSearchItem = BookCardItem;
