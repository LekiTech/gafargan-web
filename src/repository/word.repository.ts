'use server';
// import { Client } from 'pg';
import { getDataSource } from './dataSource';
import { filterWordsOfTheDay } from './wordsOfTheDay';
import { Word } from './entities/Word';
import { FoundDefinition, FoundExample, FoundSpelling } from './types.model';
import { LangToId } from '@api/languages';
import { Source } from './entities/Source';
import { SourceSchema, WordSchema } from './entities/schemas';

// Initialize a shared PG client
// const client = new Client({ connectionString: process.env.DATABASE_URL });
// client.connect();

interface SearchSpellingQuery {
  spelling: string;
  wordLangDialectId: number;
  definitionsLangDialectId: number;
  limit?: number;
}

export async function suggestions({
  spelling,
  wordLangDialectId,
  definitionsLangDialectId,
  limit = 10,
}: SearchSpellingQuery): Promise<FoundSpelling[]> {
  const findSpellingsQuery = `
    WITH combined AS (
      (SELECT spelling, id, NULL AS variant_id FROM word
      WHERE lang_dialect_id = $2 --and spelling ilike '%пе%'
      ORDER BY spelling <-> $1
      LIMIT $4)
    UNION ALL
      (SELECT spelling, word_id AS id , id AS variant_id FROM spelling_variant
      WHERE lang_dialect_id = $2 --and spelling ilike '%пе%'
      ORDER BY spelling <-> $1
      LIMIT $4)
    )
    SELECT combined.spelling, combined.id, combined.variant_id FROM combined 
    INNER JOIN (SELECT DISTINCT word_id, lang_dialect_id FROM word_details) AS wd 
      ON wd.word_id = combined.id
    WHERE wd.lang_dialect_id = $3
    ORDER BY spelling <-> $1
    LIMIT $4;
  `;
  const AppDataSource = await getDataSource();
  const res = await AppDataSource.query(findSpellingsQuery, [
    spelling,
    wordLangDialectId,
    definitionsLangDialectId,
    limit,
  ]);
  // console.log('searchSpelling', res);
  return JSON.parse(JSON.stringify(res));
}

export type SearchQuery = {
  spelling: string;
  wordLangDialectId: number;
  definitionsLangDialectId: number;
};
export async function search({
  spelling,
  wordLangDialectId,
  definitionsLangDialectId,
}: SearchQuery): Promise<Word | null> {
  const AppDataSource = await getDataSource();
  const wordRepo = AppDataSource.getRepository(WordSchema.options.tableName!);
  const word = await wordRepo.findOne({
    where: {
      spelling: spelling.toUpperCase(),
      langDialect: { id: wordLangDialectId },
      details: { langDialect: { id: definitionsLangDialectId } },
    },
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
  return JSON.parse(JSON.stringify(word));
}

export async function searchInExamples({
  spelling: searchTerm,
  wordLangDialectId,
  definitionsLangDialectId,
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
          -- check that the JSONB object has both language‐keys
          AND t.phrases_per_lang_dialect ? $2
          AND t.phrases_per_lang_dialect ? $3
    LIMIT $4;`;

  const AppDataSource = await getDataSource();
  const res = await AppDataSource.query(findExamplesQuery, [
    searchTerm,
    wordLangDialectId,
    definitionsLangDialectId,
    limit,
  ]);
  // console.log('searchInExamples', res);
  return JSON.parse(JSON.stringify(res));
}

export async function searchInDefinitions({
  spelling: searchTerm,
  wordLangDialectId,
  definitionsLangDialectId,
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
      AND ((mv.word_lang_dialect_id = $2 AND mv.definitions_lang_dialect_id = $3)
      OR (mv.word_lang_dialect_id = $3 AND mv.definitions_lang_dialect_id = $2))
    ORDER BY value, d.id DESC
    LIMIT $4;`;

  const AppDataSource = await getDataSource();
  const res = await AppDataSource.query(findDefinitionsQuery, [
    searchTerm,
    wordLangDialectId,
    definitionsLangDialectId,
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
      wordLangDialectId: LangToId['lez'],
      definitionsLangDialectId: LangToId['rus'],
    };
    const result = await search(searchQuery);
    return result;
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
