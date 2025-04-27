'use server';
// import { Client } from 'pg';
import { getDataSource } from './dataSource';
import { Word } from './entities/Word';
import { FoundSpelling } from './types.model';

// Initialize a shared PG client
// const client = new Client({ connectionString: process.env.DATABASE_URL });
// client.connect();

interface SearchSpellingQuery {
  searchTerm: string;
  wordLangDialectId: number;
  definitionsLangDialectId: number;
  limit?: number;
}

export async function suggestions({
  searchTerm,
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
    searchTerm,
    wordLangDialectId,
    definitionsLangDialectId,
    limit,
  ]);
  console.log('searchSpelling', res);
  return res;
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
  const wordRepo = AppDataSource.getRepository(Word);
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
  console.log('search', JSON.stringify(word, null, 2));
  return word;
}
