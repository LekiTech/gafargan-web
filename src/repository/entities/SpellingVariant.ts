import { Word } from './Word';
import { LangDialect } from './LangDialect';

export class SpellingVariant {
  id!: number;

  langDialect!: LangDialect | null;

  word!: Word;

  spelling!: string;

  createdAt!: Date;

  updatedAt!: Date;
}
