import { Word } from './Word';
import { LangDialect } from './LangDialect';
import { Source } from './Source';

export class SpellingVariant {
  id!: number;

  langDialectId!: number;
  langDialect!: LangDialect | null;

  word!: Word;

  spelling!: string;

  sourceId!: number;
  source!: Source | null;

  createdAt!: Date;

  updatedAt!: Date;
}
