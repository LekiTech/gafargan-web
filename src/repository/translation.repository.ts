'use server';

import { getDataSource } from './dataSource';
import { Translation } from './entities/Translation';
import { TranslationSchema } from './entities/schemas';
import { PaginatedResponse } from './types.model';

export async function getPaginatedTranslations({
  page,
  size,
}: {
  page: number;
  size: number;
}): Promise<PaginatedResponse<Translation>> {
  const AppDataSource = await getDataSource();
  const translationRepo = AppDataSource.getRepository<Translation>(
    TranslationSchema.options.tableName!,
  );
  const safePage = Math.max(1, page || 1);
  const safeSize = Math.min(size || 20, 100);

  const [itemsRaw, totalItems] = await translationRepo.findAndCount({
    take: safeSize,
    skip: (safePage - 1) * safeSize,
    order: { updatedAt: 'DESC' },
  });

  return {
    items: JSON.parse(JSON.stringify(itemsRaw)),
    totalItems,
    currentPage: safePage,
    pageSize: safeSize,
    totalPages: Math.ceil(totalItems / safeSize),
  };
}
