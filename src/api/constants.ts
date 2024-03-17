import { PaginatedResponse } from './types.dto';

export const EMPTY_PAGINATION: PaginatedResponse<any> = {
  totalItems: 0,
  totalPages: 0,
  currentPage: 0,
  pageSize: 0,
  items: [],
};
