// import { PaginatedResponse } from './types.dto';

import { PaginatedResponse } from '@repository/types.model';

export const EMPTY_PAGINATION: PaginatedResponse<any> = {
  totalItems: 0,
  totalPages: 0,
  currentPage: 0,
  pageSize: 0,
  items: [],
};
