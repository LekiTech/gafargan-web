'use server';

import { getDataSource } from './dataSource';
import { Translation } from './entities/Translation';
import { TranslationSchema } from './entities/schemas';
import { PaginatedResponse } from './types.model';

export type TranslationLink = {
  linkType: 'wordDetail' | 'definition';
  wordId: number;
  wordSpelling: string;
  wordLangDialectId: number;
  definitionsLangDialectId: number;
  wordDetailId: number;
  definitionId?: number;
};

export type TranslationLinkTarget = TranslationLink & {
  label: string;
  targetLabel: string;
};

export type TranslationWithLinks = Translation & {
  links: TranslationLink[];
};

export async function getPaginatedTranslations({
  page,
  size,
}: {
  page: number;
  size: number;
}): Promise<PaginatedResponse<TranslationWithLinks>> {
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
  const translationIds = itemsRaw.map((translation) => translation.id);
  const linksRaw =
    translationIds.length === 0
      ? []
      : await AppDataSource.query(
          `
          SELECT
            wde.translation_id AS "translationId",
            'wordDetail' AS "linkType",
            w.id AS "wordId",
            w.spelling AS "wordSpelling",
            w.lang_dialect_id AS "wordLangDialectId",
            wd.lang_dialect_id AS "definitionsLangDialectId",
            wd.id AS "wordDetailId",
            NULL::int AS "definitionId"
          FROM word_details_example wde
          JOIN word_details wd ON wd.id = wde.word_details_id
          JOIN word w ON w.id = wd.word_id
          WHERE wde.translation_id = ANY($1)

          UNION ALL

          SELECT
            de.translation_id AS "translationId",
            'definition' AS "linkType",
            w.id AS "wordId",
            w.spelling AS "wordSpelling",
            w.lang_dialect_id AS "wordLangDialectId",
            wd.lang_dialect_id AS "definitionsLangDialectId",
            wd.id AS "wordDetailId",
            d.id AS "definitionId"
          FROM definition_example de
          JOIN definition d ON d.id = de.definition_id
          JOIN word_details wd ON wd.id = d.word_details_id
          JOIN word w ON w.id = wd.word_id
          WHERE de.translation_id = ANY($1)
          ORDER BY "wordSpelling", "wordDetailId", "definitionId" NULLS FIRST;
        `,
          [translationIds],
        );
  const linksByTranslationId = linksRaw.reduce(
    (
      accumulator: Record<number, TranslationLink[]>,
      row: TranslationLink & { translationId: number },
    ) => {
      accumulator[row.translationId] = accumulator[row.translationId] ?? [];
      accumulator[row.translationId].push({
        linkType: row.linkType,
        wordId: row.wordId,
        wordSpelling: row.wordSpelling,
        wordLangDialectId: row.wordLangDialectId,
        definitionsLangDialectId: row.definitionsLangDialectId,
        wordDetailId: row.wordDetailId,
        definitionId: row.definitionId ?? undefined,
      });
      return accumulator;
    },
    {},
  );

  return {
    items: JSON.parse(
      JSON.stringify(
        itemsRaw.map((translation) => ({
          ...translation,
          links: linksByTranslationId[translation.id] ?? [],
        })),
      ),
    ),
    totalItems,
    currentPage: safePage,
    pageSize: safeSize,
    totalPages: Math.ceil(totalItems / safeSize),
  };
}
