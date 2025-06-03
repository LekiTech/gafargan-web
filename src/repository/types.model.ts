'use server';
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { TranslationPhrases } from './entities/Translation';
export interface FoundSpelling {
  id: number;
  word_spelling: string;
  variant_spelling?: string;
  variant_id?: number;
}
export interface FoundExample {
  word_id: number;
  spelling: string;
  id: number;
  phrases_per_lang_dialect: Record<string, TranslationPhrases>;
  word_lang_dialect_id: number;
  definitions_lang_dialect_id: number;
  raw: string;
  tags?: string[];
  created_at: string;
}

export interface FoundDefinition {
  word_id: number;
  spelling: string;
  id: number;
  word_lang_dialect_id: number;
  value: string;
  definitions_lang_dialect_id: number;
  tags?: string[];
  created_at: string;
}

export interface AdvancedSearchQuery {
  starts?: string;
  ends?: string;
  contains?: string;
  minLength?: number;
  maxLength?: number;
  tag?: [string, string];
  wordLangDialectIds: number[];
  definitionsLangDialectIds: number[];
}

// export interface Word {
//   spelling: string;
//   details: WordDetails[];
// }

// export interface WordDetails {
//   id: number;
//   orderIdx: number;
//   inflection?: string;
//   lang_dialect_id: number;
//   source_id: number;

//   created_by: number;
//   updated_by: number;
//   created_at: string;
//   updated_at: string;

//   definitions: Definitions[];
//   examples?: Translations[];
//   source: Source[];
// }
// export interface Definitions {
//   id: number;
//   values: {
//     value: string;
//     tags?: string[];
//   }[];
//   examples?: Translations[];
//   tags?: string[];
//   created_by: number;
//   updated_by: number;
//   created_at: string;
//   updated_at: string;
// }
