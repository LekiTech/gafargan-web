import { Word } from './Word';
import { LangDialect } from './LangDialect';
import { Source } from './Source';
import { User } from './User';

export class SpellingVariant {
  id!: number;

  langDialectId!: number;
  langDialect!: LangDialect | null;

  word!: Word;

  spelling!: string;

  sourceId!: number;
  source!: Source | null;

  createdById!: number;
  createdBy!: User;

  updatedById!: number;
  updatedBy!: User;

  createdAt!: Date;

  updatedAt!: Date;
}
