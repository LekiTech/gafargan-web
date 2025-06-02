'use server';
// import { Client } from 'pg';
import { getDataSource } from './dataSource';
import { filterWordsOfTheDay } from './wordsOfTheDay';
import { Word } from './entities/Word';
import { FoundDefinition, FoundExample, FoundSpelling } from './types.model';
import { LangToId } from '@api/languages';
import { Source } from './entities/Source';
import { SourceSchema, WordSchema } from './entities/schemas';
import { WordSearchType } from './enums';
import { In } from 'typeorm';
import { sources } from 'next/dist/compiled/webpack/webpack';

// Initialize a shared PG client
// const client = new Client({ connectionString: process.env.DATABASE_URL });
// client.connect();

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
        WHERE lang_dialect_id  = ANY($2)
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

// TODO: return always distinct list of `word_spelling`s
export async function suggestions({
  spelling,
  wordLangDialectIds: wordLangDialectId,
  definitionsLangDialectIds: definitionsLangDialectId,
  limit = 10,
}: SearchSpellingQuery) {
  //Promise<FoundSpelling[]> {
  // const queryParameters = [spelling, wordLangDialectId, definitionsLangDialectId, limit];
  // const spellingQuery = createSpellingPartQuery(wordSearchType, 'spelling', {
  //   spellingIdx: '$1',
  //   limitIdx: '$4',
  // });
  // const wordSpellingAliasQuery = createSpellingPartQuery(wordSearchType, 'word_spelling', {
  //   spellingIdx: '$1',
  //   limitIdx: '$4',
  // });
  // const variantSpellingQuery = createSpellingPartQuery(
  //   wordSearchType,
  //   'spelling_variant.spelling',
  //   {
  //     spellingIdx: '$1',
  //     limitIdx: '$4',
  //   },
  // );
  // const findSpellingsQuery = `
  //   WITH combined AS (
  //     (SELECT spelling AS word_spelling, id, NULL AS variant_spelling, NULL AS variant_id FROM word
  //     WHERE lang_dialect_id = $2
  //       AND id NOT IN (
  //         SELECT word_id FROM spelling_variant WHERE lang_dialect_id = 1
  //       )
  //     ${spellingQuery})
  //   UNION ALL
  //     (SELECT word.spelling AS word_spelling, word_id AS id, spelling_variant.spelling AS variant_spelling, spelling_variant.id AS variant_id FROM spelling_variant
  //     JOIN word ON word.id = spelling_variant.word_id
  //     WHERE spelling_variant.lang_dialect_id = $2
  //     ${variantSpellingQuery})
  //   )
  //   SELECT combined.word_spelling, combined.id, combined.variant_spelling, combined.variant_id FROM combined
  //   INNER JOIN (SELECT DISTINCT word_id, lang_dialect_id FROM word_details) AS wd
  //     ON wd.word_id = combined.id
  //   WHERE wd.lang_dialect_id = $3
  //   ${wordSpellingAliasQuery};
  // `;
  // const AppDataSource = await getDataSource();
  // const res = await AppDataSource.query(findSpellingsQuery, queryParameters);
  // // console.log('searchSpelling', res);
  // return JSON.parse(JSON.stringify(res));
}

function createSpellingPartQuery(
  wordSearchType: WordSearchType,
  columnName: 'spelling' | 'word_spelling' | 'spelling_variant.spelling',
  paramIdxs: { spellingIdx: string; limitIdx: string },
): string {
  const { spellingIdx, limitIdx } = paramIdxs;
  switch (wordSearchType) {
    case WordSearchType.PREFIX:
      return `
        AND spelling ILIKE ${spellingIdx} || '%'
        ORDER BY ${columnName}
        LIMIT ${limitIdx}`;
    case WordSearchType.SUFFIX:
      return `
        AND spelling ILIKE '%' || ${spellingIdx}
        ORDER BY ${columnName}
        LIMIT ${limitIdx}`;
    case WordSearchType.CONTAINS:
      return `
        AND spelling ILIKE '%' || ${spellingIdx} || '%'
        ORDER BY ${columnName}
        LIMIT ${limitIdx}`;
    case WordSearchType.FUZZY:
      return `
        ORDER BY ${columnName} <-> ${spellingIdx}
        LIMIT ${limitIdx}`;
    default:
      return `
        AND spelling ILIKE '%' || ${spellingIdx} || '%'
        ORDER BY ${columnName}
        LIMIT ${limitIdx}`;
  }
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
        details: { langDialect: { id: In(definitionsLangDialectIds) } },
      },
      {
        spellingVariants: {
          spelling: spelling.toUpperCase(),
          langDialect: { id: In(wordLangDialectIds) },
        },
        langDialect: { id: In(wordLangDialectIds) },
        details: { langDialect: { id: In(definitionsLangDialectIds) } },
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
      details: {
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
  const sortedWords = wordWithDefinitions.sort((a, b) => {
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
  // console.log('search', JSON.stringify(word, null, 2));
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
      mv.word_lang_dialect_id AS word_lang_dialect_id,
      -- pull out the single matched JSON value
        v.elem->>'value' AS value,
        mv.definitions_lang_dialect_id AS definitions_lang_dialect_id,
      tags, d.created_at
    FROM definition d  
      JOIN mv_word_definition_translation AS mv ON d.id = mv.definition_id 
      JOIN word w ON w.id = word_id
      -- 1) UNNEST the SQL JSON[] array into individual JSON objects:
      CROSS JOIN LATERAL unnest(d.values) AS v(elem)
    WHERE
      -- 2) Search inside each JSON object’s "value" field:
      v.elem ->> 'value' ILIKE '%' || $1 || '%'
      -- 3) Compare your dialect IDs as normal integers:
      AND mv.word_lang_dialect_id = ANY($3) 
      AND mv.definitions_lang_dialect_id = ANY($2)
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

export async function getSources(): Promise<Source[]> {
  const AppDataSource = await getDataSource();
  const sourceRepo = AppDataSource.getRepository(SourceSchema.options.tableName!);
  const sources = await sourceRepo.find({
    select: {
      id: true,
      name: true,
      authors: true,
      publicationYear: true,
      providedBy: true,
      providedByUrl: true,
      processedBy: true,
      copyright: true,
      seeSourceUrl: true,
      description: true,
    },
  });
  // console.log('search', JSON.stringify(word, null, 2));
  return JSON.parse(JSON.stringify(sources));
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
      details: { langDialect: { id: definitionsLangDialectId } },
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
      details: {
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
