'use server';
// import { Client } from 'pg';
import { getDataSource } from './dataSource';
import { filterWordsOfTheDay } from './wordsOfTheDay';
import { Word } from './entities/Word';
import {
  AdvancedSearchQuery,
  FoundDefinition,
  FoundExample,
  FoundSpelling,
  PaginatedResponse,
} from './types.model';
import { LangToId } from '@api/languages';
import { Source } from './entities/Source';
import { SourceSchema, WordSchema } from './entities/schemas';
import { WordSearchType } from './enums';
import { FindOperator, ILike, In } from 'typeorm';
import { sources } from 'next/dist/compiled/webpack/webpack';
import type { TranslationLinkTarget } from './translation.repository';

// Initialize a shared PG client
// const client = new Client({ connectionString: process.env.DATABASE_URL });
// client.connect();

export type SimpleWordSearchResult = {
  id: number;
  spelling: string;
  langDialectId: number;
};

export async function simpleSearch({
  spelling,
  fromLangDialectId,
  limit = 20,
}: {
  spelling: string;
  fromLangDialectId: number;
  limit?: number;
}): Promise<SimpleWordSearchResult[]> {
  const AppDataSource = await getDataSource();
  const wordRepo = AppDataSource.getRepository(WordSchema.options.tableName!);
  const normalizedSpelling = spelling.trim();
  if (!normalizedSpelling) {
    return [];
  }
  const words = await wordRepo.find({
    where: { spelling: ILike(`${normalizedSpelling}%`), langDialectId: fromLangDialectId },
    select: ['id', 'spelling', 'langDialectId'],
    order: { spelling: 'ASC' },
    take: limit,
  });
  console.log('simpleSearch', JSON.stringify(words, null, 2));
  return JSON.parse(JSON.stringify(words));
}

export async function getTranslationLinkTargetsForWords(
  wordIds: number[],
): Promise<TranslationLinkTarget[]> {
  const safeWordIds = Array.from(new Set(wordIds.filter((id) => Number.isFinite(id))));
  if (safeWordIds.length === 0) {
    return [];
  }

  const AppDataSource = await getDataSource();
  const rows = await AppDataSource.query(
    `
      SELECT
        'wordDetail' AS "linkType",
        w.id AS "wordId",
        w.spelling AS "wordSpelling",
        w.lang_dialect_id AS "wordLangDialectId",
        wd.lang_dialect_id AS "definitionsLangDialectId",
        wd.id AS "wordDetailId",
        NULL::int AS "definitionId",
        w.spelling AS "label",
        'Details #' || wd.id ||
          COALESCE(' · ' || NULLIF(wd.inflection, ''), '') AS "targetLabel"
      FROM word_details wd
      JOIN word w ON w.id = wd.word_id
      WHERE w.id = ANY($1)

      UNION ALL

      SELECT
        'definition' AS "linkType",
        w.id AS "wordId",
        w.spelling AS "wordSpelling",
        w.lang_dialect_id AS "wordLangDialectId",
        wd.lang_dialect_id AS "definitionsLangDialectId",
        wd.id AS "wordDetailId",
        d.id AS "definitionId",
        w.spelling AS "label",
        'Definition #' || d.id ||
          COALESCE(' · ' || NULLIF(left(d.values->0->>'value', 80), ''), '') AS "targetLabel"
      FROM definition d
      JOIN word_details wd ON wd.id = d.word_details_id
      JOIN word w ON w.id = wd.word_id
      WHERE w.id = ANY($1)
      ORDER BY "wordSpelling", "wordDetailId", "definitionId" NULLS FIRST;
    `,
    [safeWordIds],
  );

  return JSON.parse(JSON.stringify(rows));
}
interface SearchSpellingQuery {
  spelling: string;
  wordLangDialectIds: number[];
  definitionsLangDialectIds: number[];
  limit?: number;
}

export async function suggestionsFuzzy({
  spelling,
  wordLangDialectIds,
  definitionsLangDialectIds,
  limit = 10,
}: SearchSpellingQuery): Promise<FoundSpelling[]> {
  const queryParameters = [spelling, wordLangDialectIds, definitionsLangDialectIds, limit];
  const findSpellingsQuery = `
    WITH combined AS (
      (SELECT spelling AS word_spelling, id, NULL AS variant_spelling, NULL AS variant_id FROM word
        WHERE lang_dialect_id = ANY($2)
        ORDER BY spelling <-> $1
        LIMIT $4
      )
      UNION ALL
      (SELECT word.spelling AS word_spelling, word_id AS id, spelling_variant.spelling AS variant_spelling, spelling_variant.id AS variant_id FROM spelling_variant
        JOIN word ON word.id = spelling_variant.word_id
        WHERE spelling_variant.lang_dialect_id = ANY($2)
        ORDER BY spelling_variant.spelling <-> $1
        LIMIT $4
      )
    ),
    filtered AS (SELECT combined.word_spelling, combined.id, combined.variant_spelling, combined.variant_id,
        word_spelling <-> $1 AS distance
      FROM combined 
      INNER JOIN (SELECT DISTINCT word_id  FROM word_details 
        WHERE lang_dialect_id = ANY($3)
      ) AS wd 
        ON wd.word_id = combined.id
    ),
    ranked AS (
      SELECT *, ROW_NUMBER() OVER (
        PARTITION BY word_spelling 
        ORDER BY 
          (variant_spelling IS NULL), -- false (0) comes before true (1)
          distance
      ) AS rn
      FROM filtered
    )
    SELECT word_spelling, id, variant_spelling, variant_id
    FROM ranked
    WHERE rn = 1
    ORDER BY distance
    LIMIT $4;
  `;
  const AppDataSource = await getDataSource();
  const res = await AppDataSource.query(findSpellingsQuery, queryParameters);
  // console.log('searchSpelling', res);
  return JSON.parse(JSON.stringify(res));
}

export async function searchAdvanced({
  page: inputPage,
  pageSize: inputLimit,
  starts,
  ends,
  contains,
  minLength,
  maxLength,
  tag,
  wordLangDialectIds,
  definitionsLangDialectIds,
}: AdvancedSearchQuery): Promise<PaginatedResponse<Word>> {
  const AppDataSource = await getDataSource();
  const wordRepo = AppDataSource.getRepository(WordSchema.options.tableName!);

  const page = Math.max(1, inputPage || 1); // ensure page >= 1
  const limit = Math.min(inputLimit || 20, 100); // optional max cap
  const query = wordRepo
    .createQueryBuilder('word')
    // top-level relations
    .leftJoinAndSelect('word.langDialect', 'wordLangDialect')
    .leftJoinAndSelect('word.source', 'wordSource')
    .leftJoinAndSelect('word.createdBy', 'wordCreatedBy')
    .leftJoinAndSelect('word.updatedBy', 'wordUpdatedBy')

    // spellingVariants and their relations
    .leftJoinAndSelect('word.spellingVariants', 'variant')
    .leftJoinAndSelect('variant.langDialect', 'variantLangDialect')
    .leftJoinAndSelect('variant.source', 'variantSource')

    // details and their nested relations
    .leftJoinAndSelect('word.wordDetails', 'detail')
    .leftJoinAndSelect('detail.langDialect', 'detailLangDialect')
    .leftJoinAndSelect('detail.source', 'detailSource')
    .leftJoinAndSelect('detail.createdBy', 'detailCreatedBy')
    .leftJoinAndSelect('detail.updatedBy', 'detailUpdatedBy')
    // detail.examples (M:N)
    .leftJoinAndSelect('detail.examples', 'detailExamples')
    // detail.definitions and their nested relations
    .leftJoinAndSelect('detail.definitions', 'definition')
    .leftJoinAndSelect('definition.createdBy', 'definitionCreatedBy')
    .leftJoinAndSelect('definition.updatedBy', 'definitionUpdatedBy')
    .leftJoinAndSelect('definition.examples', 'definitionExamples')
    .where(
      '(word.lang_dialect_id = ANY(:wordLangDialectIds) OR variant.lang_dialect_id = ANY(:wordLangDialectIds))',
      { wordLangDialectIds },
    )
    .andWhere('detail.lang_dialect_id = ANY(:definitionsLangDialectIds)', {
      definitionsLangDialectIds,
    });

  const wordConditions: string[] = [];
  const variantConditions: string[] = [];
  const params: Record<string, any> = {};

  if (minLength !== undefined) {
    // query.andWhere(
    //   '(LENGTH(word.spelling) >= :minLength OR LENGTH(variant.spelling) >= :minLength)',
    //   { minLength },
    // );
    wordConditions.push('LENGTH(word.spelling) >= :minLength');
    variantConditions.push('LENGTH(variant.spelling) >= :minLength');
    params.minLength = minLength;
  }
  if (maxLength !== undefined) {
    // query.andWhere(
    //   '(LENGTH(word.spelling) <= :maxLength OR LENGTH(variant.spelling) <= :maxLength)',
    //   { maxLength },
    // );
    wordConditions.push('LENGTH(word.spelling) <= :maxLength');
    variantConditions.push('LENGTH(variant.spelling) <= :maxLength');
    params.maxLength = maxLength;
  }
  if (starts?.trim()) {
    wordConditions.push('word.spelling ILIKE :starts');
    variantConditions.push('variant.spelling ILIKE :starts');
    params.starts = `${starts}%`;
  }
  if (contains?.trim()) {
    wordConditions.push('word.spelling ILIKE :contains');
    variantConditions.push('variant.spelling ILIKE :contains');
    params.contains = `%${contains}%`;
  }
  if (ends?.trim()) {
    wordConditions.push('word.spelling ILIKE :ends');
    variantConditions.push('variant.spelling ILIKE :ends');
    params.ends = `%${ends}`;
  }
  if (wordConditions.length > 0) {
    query.andWhere(
      `((${wordConditions.join(' AND ')}) OR (${variantConditions.join(' AND ')}))`,
      params,
    );
  }

  if (tag != undefined) {
    if (tag.includes(';')) {
      const tags = tag
        .split(';')
        .map((t) => t.trim())
        .filter(Boolean);

      query.andWhere(
        `(
        EXISTS (
          SELECT 1 FROM unnest(:tags::text[]) AS t
          WHERE t = ANY(definition.tags)
        )
        OR EXISTS (
          SELECT 1 FROM jsonb_array_elements(definition.values) AS v(elem),
                       unnest(:tags::text[]) AS t
          WHERE v.elem ? 'tags' AND (v.elem -> 'tags') @> to_jsonb(ARRAY[t])
        )
      )`,
        { tags },
      );
    } else {
      query.andWhere(
        `(:tag = ANY(definition.tags)
          OR EXISTS (
            SELECT 1 FROM jsonb_array_elements(definition.values) AS v(elem)
            WHERE v.elem ? 'tags' AND (v.elem -> 'tags') @> to_jsonb(ARRAY[:tag]::text[])
          ))`,
        { tag: tag },
      );
    }
  }

  // query
  //   .orderBy('word.spelling', 'ASC')
  //   .addOrderBy('variant.spelling', 'ASC')
  //   .skip((page - 1) * limit)
  //   .take(limit);
  const sortExpr = `
  CASE
    WHEN (variant.spelling ILIKE COALESCE(:starts, '') AND word.spelling NOT ILIKE COALESCE(:starts, ''))
      THEN variant.spelling
    WHEN (variant.spelling ILIKE COALESCE(:contains, '') AND word.spelling NOT ILIKE COALESCE(:contains, ''))
      THEN variant.spelling
    WHEN (variant.spelling ILIKE COALESCE(:ends, '') AND word.spelling NOT ILIKE COALESCE(:ends, ''))
      THEN variant.spelling
    ELSE word.spelling
  END
`;

  query
    .addSelect(sortExpr, 'sort_spelling')
    .orderBy('sort_spelling', 'ASC')
    .skip((page - 1) * limit)
    .take(limit);

  // Set sort params even if null, to ensure proper binding
  query.setParameters({
    ...params,
    starts: params.starts ?? null,
    contains: params.contains ?? null,
    ends: params.ends ?? null,
  });

  // console.log(query.getQueryAndParameters());

  const [dataRaw, totalItems] = await query.getManyAndCount();

  const items = JSON.parse(JSON.stringify(dataRaw)) as Word[];
  // console.log(items);
  return {
    items,
    totalItems,
    currentPage: page,
    pageSize: limit,
    totalPages: Math.ceil(totalItems / limit),
  };
}

export async function getWordsByIds(ids: number[]): Promise<Word[]> {
  const uniqueIds = Array.from(new Set(ids.filter((id) => Number.isFinite(id))));
  if (uniqueIds.length === 0) {
    return [];
  }

  const AppDataSource = await getDataSource();
  const wordRepo = AppDataSource.getRepository<Word>(WordSchema.options.tableName!);
  const words = await wordRepo.find({
    where: { id: In(uniqueIds) },
    relations: {
      langDialect: true,
      source: true,
      spellingVariants: true,
      wordDetails: {
        langDialect: true,
        source: true,
        examples: true,
        definitions: {
          examples: true,
        },
      },
    },
    order: {
      spelling: 'ASC',
      wordDetails: {
        orderIdx: 'ASC',
        definitions: {
          id: 'ASC',
          examples: {
            id: 'ASC',
          },
        },
        examples: {
          id: 'ASC',
        },
      },
    },
  });

  return JSON.parse(JSON.stringify(words));
}

export type WordHistorySnapshot = {
  id: number;
  spelling: string;
  langDialectId: number;
  sourceId: number;
  spellingVariants: {
    state: 'unchanged';
    id: number;
    spelling: string;
    sourceId: number;
    langDialectId: number;
  }[];
  wordDetails: {
    state: 'unchanged';
    id: number;
    inflection?: string;
    langDialectId: number;
    sourceId: number;
    definitions: {
      state: 'unchanged';
      id: number;
      values: { value: string; tags?: string[] }[];
      tags?: string[];
      examples: {
        state: 'unchanged';
        id: number;
        phrasesPerLangDialect: Record<string, { phrase: string; tags?: string[] }[]>;
        tags?: string[];
      }[];
    }[];
    examples: {
      state: 'unchanged';
      id: number;
      phrasesPerLangDialect: Record<string, { phrase: string; tags?: string[] }[]>;
      tags?: string[];
    }[];
  }[];
};

export async function getWordsHistoryByIds(
  ids: number[],
  validTo: Date,
): Promise<WordHistorySnapshot[]> {
  const uniqueIds = Array.from(new Set(ids.filter((id) => Number.isFinite(id))));
  if (uniqueIds.length === 0) {
    return [];
  }

  const AppDataSource = await getDataSource();
  const rows = await AppDataSource.query(
    `
    WITH target AS (SELECT $2::timestamp AS reviewed_at),
    history_words AS (
      SELECT DISTINCT ON (hw.id) hw.*
      FROM history_word hw, target
      WHERE hw.id = ANY($1)
        AND hw.valid_to BETWEEN target.reviewed_at - INTERVAL '5 minutes'
                            AND target.reviewed_at + INTERVAL '5 minutes'
      ORDER BY hw.id, ABS(EXTRACT(EPOCH FROM (hw.valid_to - target.reviewed_at))) ASC
    ),
    current_words AS (
      SELECT w.*
      FROM word w, target
      WHERE w.id = ANY($1)
        AND w.created_at < target.reviewed_at
        AND NOT EXISTS (SELECT 1 FROM history_words hw WHERE hw.id = w.id)
    ),
    snapshot_words AS (
      SELECT id, spelling, lang_dialect_id, source_id FROM history_words
      UNION ALL
      SELECT id, spelling, lang_dialect_id, source_id FROM current_words
    ),
    history_details AS (
      SELECT DISTINCT ON (hwd.id) hwd.*
      FROM history_word_details hwd
      JOIN snapshot_words sw ON sw.id = hwd.word_id
      JOIN target ON TRUE
      WHERE hwd.valid_to BETWEEN target.reviewed_at - INTERVAL '5 minutes'
                             AND target.reviewed_at + INTERVAL '5 minutes'
      ORDER BY hwd.id, ABS(EXTRACT(EPOCH FROM (hwd.valid_to - target.reviewed_at))) ASC
    ),
    current_details AS (
      SELECT wd.*
      FROM word_details wd
      JOIN snapshot_words sw ON sw.id = wd.word_id
      JOIN target ON TRUE
      WHERE wd.created_at < target.reviewed_at
        AND NOT EXISTS (SELECT 1 FROM history_details hwd WHERE hwd.id = wd.id)
    ),
    snapshot_details AS (
      SELECT id, word_id, order_idx, inflection, lang_dialect_id, source_id FROM history_details
      UNION ALL
      SELECT id, word_id, order_idx, inflection, lang_dialect_id, source_id FROM current_details
    ),
    history_definitions AS (
      SELECT DISTINCT ON (hd.id) hd.*
      FROM history_definition hd
      JOIN snapshot_details sd ON sd.id = hd.word_details_id
      JOIN target ON TRUE
      WHERE hd.valid_to BETWEEN target.reviewed_at - INTERVAL '5 minutes'
                            AND target.reviewed_at + INTERVAL '5 minutes'
      ORDER BY hd.id, ABS(EXTRACT(EPOCH FROM (hd.valid_to - target.reviewed_at))) ASC
    ),
    current_definitions AS (
      SELECT d.*
      FROM definition d
      JOIN snapshot_details sd ON sd.id = d.word_details_id
      JOIN target ON TRUE
      WHERE d.created_at < target.reviewed_at
        AND NOT EXISTS (SELECT 1 FROM history_definitions hd WHERE hd.id = d.id)
    ),
    snapshot_definitions AS (
      SELECT id, word_details_id, values, tags FROM history_definitions
      UNION ALL
      SELECT id, word_details_id, values, tags FROM current_definitions
    ),
    history_variants AS (
      SELECT DISTINCT ON (hsv.id) hsv.*
      FROM history_spelling_variant hsv
      JOIN snapshot_words sw ON sw.id = hsv.word_id
      JOIN target ON TRUE
      WHERE hsv.valid_to BETWEEN target.reviewed_at - INTERVAL '5 minutes'
                             AND target.reviewed_at + INTERVAL '5 minutes'
      ORDER BY hsv.id, ABS(EXTRACT(EPOCH FROM (hsv.valid_to - target.reviewed_at))) ASC
    ),
    current_variants AS (
      SELECT sv.*
      FROM spelling_variant sv
      JOIN snapshot_words sw ON sw.id = sv.word_id
      JOIN target ON TRUE
      WHERE sv.created_at < target.reviewed_at
        AND NOT EXISTS (SELECT 1 FROM history_variants hsv WHERE hsv.id = sv.id)
    ),
    snapshot_variants AS (
      SELECT id, word_id, spelling, lang_dialect_id, source_id FROM history_variants
      UNION ALL
      SELECT id, word_id, spelling, lang_dialect_id, source_id FROM current_variants
    ),
    history_definition_examples AS (
      SELECT DISTINCT ON (hde.definition_id, hde.translation_id)
        hde.definition_id,
        hde.translation_id
      FROM history_definition_example hde
      JOIN snapshot_definitions sd ON sd.id = hde.definition_id
      JOIN target ON TRUE
      WHERE hde.valid_to BETWEEN target.reviewed_at - INTERVAL '5 minutes'
                             AND target.reviewed_at + INTERVAL '5 minutes'
      ORDER BY
        hde.definition_id,
        hde.translation_id,
        ABS(EXTRACT(EPOCH FROM (hde.valid_to - target.reviewed_at))) ASC
    ),
    current_definition_examples AS (
      SELECT de.definition_id, de.translation_id
      FROM definition_example de
      JOIN snapshot_definitions sd ON sd.id = de.definition_id
      JOIN target ON TRUE
      WHERE de.created_at < target.reviewed_at
        AND NOT EXISTS (
          SELECT 1
          FROM history_definition_examples hde
          WHERE hde.definition_id = de.definition_id
            AND hde.translation_id = de.translation_id
        )
    ),
    snapshot_definition_examples AS (
      SELECT definition_id, translation_id FROM history_definition_examples
      UNION ALL
      SELECT definition_id, translation_id FROM current_definition_examples
    ),
    history_word_detail_examples AS (
      SELECT DISTINCT ON (hwde.word_details_id, hwde.translation_id)
        hwde.word_details_id,
        hwde.translation_id
      FROM history_word_details_example hwde
      JOIN snapshot_details sd ON sd.id = hwde.word_details_id
      JOIN target ON TRUE
      WHERE hwde.valid_to BETWEEN target.reviewed_at - INTERVAL '5 minutes'
                              AND target.reviewed_at + INTERVAL '5 minutes'
      ORDER BY
        hwde.word_details_id,
        hwde.translation_id,
        ABS(EXTRACT(EPOCH FROM (hwde.valid_to - target.reviewed_at))) ASC
    ),
    current_word_detail_examples AS (
      SELECT wde.word_details_id, wde.translation_id
      FROM word_details_example wde
      JOIN snapshot_details sd ON sd.id = wde.word_details_id
      JOIN target ON TRUE
      WHERE wde.created_at < target.reviewed_at
        AND NOT EXISTS (
          SELECT 1
          FROM history_word_detail_examples hwde
          WHERE hwde.word_details_id = wde.word_details_id
            AND hwde.translation_id = wde.translation_id
        )
    ),
    snapshot_word_detail_examples AS (
      SELECT word_details_id, translation_id FROM history_word_detail_examples
      UNION ALL
      SELECT word_details_id, translation_id FROM current_word_detail_examples
    ),
    snapshot_translation_ids AS (
      SELECT translation_id AS id FROM snapshot_definition_examples
      UNION
      SELECT translation_id AS id FROM snapshot_word_detail_examples
    ),
    history_translation_rows AS (
      SELECT DISTINCT ON (ht.id) ht.*
      FROM history_translations ht
      JOIN snapshot_translation_ids sti ON sti.id = ht.id
      JOIN target ON TRUE
      WHERE ht.valid_to BETWEEN target.reviewed_at - INTERVAL '5 minutes'
                            AND target.reviewed_at + INTERVAL '5 minutes'
      ORDER BY ht.id, ABS(EXTRACT(EPOCH FROM (ht.valid_to - target.reviewed_at))) ASC
    ),
    current_translations AS (
      SELECT t.*
      FROM translations t
      JOIN snapshot_translation_ids sti ON sti.id = t.id
      JOIN target ON TRUE
      WHERE t.created_at < target.reviewed_at
        AND NOT EXISTS (SELECT 1 FROM history_translation_rows ht WHERE ht.id = t.id)
    ),
    snapshot_translations AS (
      SELECT id, phrases_per_lang_dialect, tags, raw FROM history_translation_rows
      UNION ALL
      SELECT id, phrases_per_lang_dialect, tags, raw FROM current_translations
    )
    SELECT
      hw.id,
      hw.spelling,
      hw.lang_dialect_id AS "langDialectId",
      hw.source_id AS "sourceId",
      COALESCE(
        (
          SELECT jsonb_agg(
            jsonb_build_object(
              'state', 'unchanged',
              'id', sv.id,
              'spelling', sv.spelling,
              'langDialectId', sv.lang_dialect_id,
              'sourceId', sv.source_id
            )
            ORDER BY sv.spelling
          )
          FROM snapshot_variants sv
          WHERE sv.word_id = hw.id
        ),
        '[]'::jsonb
      ) AS "spellingVariants",
      COALESCE(
        (
          SELECT jsonb_agg(
            jsonb_build_object(
              'state', 'unchanged',
              'id', wd.id,
              'inflection', wd.inflection,
              'langDialectId', wd.lang_dialect_id,
              'sourceId', wd.source_id,
              'definitions', COALESCE(
                (
                  SELECT jsonb_agg(
                    jsonb_build_object(
                      'state', 'unchanged',
                      'id', d.id,
                      'values', d.values,
                      'tags', d.tags,
                      'examples', COALESCE(
                        (
                          SELECT jsonb_agg(
                            jsonb_build_object(
                              'state', 'unchanged',
                              'id', t.id,
                              'phrasesPerLangDialect', t.phrases_per_lang_dialect,
                              'tags', t.tags,
                              'raw', t.raw
                            )
                            ORDER BY t.id
                          )
                          FROM snapshot_definition_examples de
                          JOIN snapshot_translations t ON t.id = de.translation_id
                          WHERE de.definition_id = d.id
                        ),
                        '[]'::jsonb
                      )
                    )
                    ORDER BY d.id
                  )
                  FROM snapshot_definitions d
                  WHERE d.word_details_id = wd.id
                ),
                '[]'::jsonb
              ),
              'examples', COALESCE(
                (
                  SELECT jsonb_agg(
                    jsonb_build_object(
                      'state', 'unchanged',
                      'id', t.id,
                      'phrasesPerLangDialect', t.phrases_per_lang_dialect,
                      'tags', t.tags,
                      'raw', t.raw
                    )
                    ORDER BY t.id
                  )
                  FROM snapshot_word_detail_examples wde
                  JOIN snapshot_translations t ON t.id = wde.translation_id
                  WHERE wde.word_details_id = wd.id
                ),
                '[]'::jsonb
              )
            )
            ORDER BY wd.order_idx NULLS LAST, wd.id
          )
          FROM snapshot_details wd
          WHERE wd.word_id = hw.id
        ),
        '[]'::jsonb
      ) AS "wordDetails"
    FROM snapshot_words hw
    ORDER BY hw.spelling ASC;
    `,
    [uniqueIds, validTo.toUTCString()],
  );

  return JSON.parse(JSON.stringify(rows));
}

export type SearchQuery = {
  spelling: string;
  wordLangDialectIds: number[];
  definitionsLangDialectIds: number[];
};
export async function search({
  spelling,
  wordLangDialectIds,
  definitionsLangDialectIds,
}: SearchQuery): Promise<Word[] | null> {
  const AppDataSource = await getDataSource();
  const wordRepo = AppDataSource.getRepository(WordSchema.options.tableName!);
  const wordWithDefinitions = await wordRepo.find({
    where: [
      {
        spelling: spelling.toUpperCase(),
        langDialect: { id: In(wordLangDialectIds) },
        wordDetails: { langDialect: { id: In(definitionsLangDialectIds) } },
      },
      {
        spellingVariants: {
          spelling: spelling.toUpperCase(),
          langDialect: { id: In(wordLangDialectIds) },
        },
        langDialect: { id: In(wordLangDialectIds) },
        wordDetails: { langDialect: { id: In(definitionsLangDialectIds) } },
      },
    ],
    relations: {
      // top-level relations
      langDialect: true,
      source: true,
      createdBy: true,
      updatedBy: true,
      spellingVariants: {
        langDialect: true,
        source: true,
      },

      // nest “details” and everything under it
      wordDetails: {
        langDialect: true,
        source: true,
        createdBy: true,
        updatedBy: true,
        examples: true, // the M:N to Translation
        definitions: {
          createdBy: true,
          updatedBy: true,
          examples: true, // the M:N to Translation on definitions
        },
      },
    },
  });
  wordWithDefinitions.sort((a, b) => {
    // Sort by spelling match first
    const aSpellingMatch = a.spelling.toUpperCase() === spelling.toUpperCase();
    const bSpellingMatch = b.spelling.toUpperCase() === spelling.toUpperCase();
    if (aSpellingMatch && !bSpellingMatch) {
      // a matches, b does not
      return -1;
    }
    if (!aSpellingMatch && bSpellingMatch) {
      // b matches, a does not
      return 1;
    }
    // If both match or neither matches, sort by createdAt date
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
  // console.log('search', JSON.stringify(wordWithDefinitions, null, 2));
  return JSON.parse(JSON.stringify(wordWithDefinitions));
}

export async function searchInExamples({
  spelling: searchTerm,
  wordLangDialectIds,
  definitionsLangDialectIds,
  limit = 10,
}: SearchSpellingQuery): Promise<FoundExample[]> {
  const findExamplesQuery = `
    SELECT word_id, spelling, t.id, phrases_per_lang_dialect, raw, tags,
      mv.word_lang_dialect_id AS word_lang_dialect_id,
      mv.definitions_lang_dialect_id AS definitions_lang_dialect_id,
      t.created_at
    FROM translations t 
      JOIN mv_word_definition_translation AS mv ON t.id = mv.translation_id
      JOIN word w ON w.id = word_id
    WHERE raw ILIKE '%' || $1 || '%'
          -- check that the JSONB object has all keys of both languages (multiple dialects)
          AND t.phrases_per_lang_dialect ?| $2
          AND t.phrases_per_lang_dialect ?| $3
    LIMIT $4;`;

  const AppDataSource = await getDataSource();
  const res = await AppDataSource.query(findExamplesQuery, [
    searchTerm,
    wordLangDialectIds.map(String),
    definitionsLangDialectIds.map(String),
    limit,
  ]);
  // console.log('searchInExamples', res);
  return JSON.parse(JSON.stringify(res));
}

export async function searchInDefinitions({
  spelling: searchTerm,
  wordLangDialectIds,
  definitionsLangDialectIds,
  limit = 10,
}: SearchSpellingQuery): Promise<FoundDefinition[]> {
  const findDefinitionsQuery = `
    SELECT DISTINCT ON (d.id, value)
      word_id, spelling, 
      w.lang_dialect_id AS word_lang_dialect_id,
      -- pull out the single matched JSON value
        v.elem->>'value' AS value,
        wd.lang_dialect_id AS definitions_lang_dialect_id,
      tags, d.created_at
    FROM definition d  
      JOIN word_details AS wd ON d.word_details_id = wd.id 
      JOIN word w ON w.id = word_id
      CROSS JOIN LATERAL jsonb_array_elements(d.values) AS v(elem)
    WHERE
      -- 1) Search inside each JSON object’s "value" field:
      v.elem ->> 'value' ILIKE '%' || $1 || '%'
      -- 2) Compare your dialect IDs as normal integers:
      AND w.lang_dialect_id = ANY($3) 
      AND wd.lang_dialect_id = ANY($2)
    ORDER BY value, d.id DESC
    LIMIT $4;`;

  const AppDataSource = await getDataSource();
  const res = await AppDataSource.query(findDefinitionsQuery, [
    searchTerm,
    wordLangDialectIds,
    definitionsLangDialectIds,
    limit,
  ]);
  // console.log('searchInDefinitions', res);
  return JSON.parse(JSON.stringify(res));
}

export async function getWordOfTheDay(): Promise<Word | null> {
  try {
    const dayOfTheYear = getDayOfTheYear();
    const wordIndex = filterWordsOfTheDay.length <= dayOfTheYear ? 0 : dayOfTheYear;
    const searchQuery: SearchQuery = {
      spelling: filterWordsOfTheDay[wordIndex],
      wordLangDialectIds: LangToId['lez'],
      definitionsLangDialectIds: LangToId['rus'],
    };
    const result = await search(searchQuery);
    return result?.[0] ?? null;
  } catch (e) {
    console.error(e);
  }
  return null;
}

function getDayOfTheYear(): number {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const diff =
    now.getTime() -
    start.getTime() +
    (start.getTimezoneOffset() - now.getTimezoneOffset()) * 60 * 1000;
  const oneDay = 1000 * 60 * 60 * 24;
  const day = Math.floor(diff / oneDay);
  return day;
}

export type PaginationQuery = {
  page: number;
  size: number;
  wordLangDialectId: number;
  definitionsLangDialectId: number;
};
export async function getPaginatedWords({
  page,
  size,
  wordLangDialectId,
  definitionsLangDialectId,
}: PaginationQuery): Promise<Word[]> {
  const AppDataSource = await getDataSource();
  const wordRepo = AppDataSource.getRepository(WordSchema.options.tableName!);
  const words = await wordRepo.find({
    where: {
      langDialect: { id: wordLangDialectId },
      wordDetails: { langDialect: { id: definitionsLangDialectId } },
    },
    take: size,
    skip: page * size,
    relations: {
      // top-level relations
      langDialect: true,
      createdBy: true,
      updatedBy: true,
      spellingVariants: true,

      // nest “details” and everything under it
      wordDetails: {
        langDialect: true,
        source: true,
        createdBy: true,
        updatedBy: true,
        examples: true, // the M:N to Translation
        definitions: {
          createdBy: true,
          updatedBy: true,
          examples: true, // the M:N to Translation on definitions
        },
      },
    },
  });
  // console.log('search', JSON.stringify(word, null, 2));
  return JSON.parse(JSON.stringify(words));
}
