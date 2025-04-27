'use server';
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
export interface FoundSpelling {
  id: number;
  spelling: string;
  variant_id?: number;
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
