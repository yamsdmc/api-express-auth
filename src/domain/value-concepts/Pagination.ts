export interface PaginationParams {
  offset: number;
  limit: number;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  hasMore: boolean;
}
