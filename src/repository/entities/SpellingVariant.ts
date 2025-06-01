import { Word } from './Word';
import { LangDialect } from './LangDialect';
import { Source } from './Source';

export class SpellingVariant {
  id!: number;

  langDialect!: LangDialect | null;

  word!: Word;

  spelling!: string;

  source!: Source | null;

  createdAt!: Date;

  updatedAt!: Date;
}
