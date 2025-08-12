import { Word } from './Word';
import { LangDialect } from './LangDialect';
import { Source } from './Source';
import { User } from './User';
import type { Definition } from './Definition';
import { Translation } from './Translation';
import { WordDetailsExample } from './WordDetailsExample';

export class WordDetail {
  id!: number;

  wordId!: number;
  word!: Word;

  orderIdx!: number | null;

  inflection!: string | null;

  langDialectId!: number;
  langDialect!: LangDialect;

  sourceId!: number;
  source!: Source | null;

  createdById!: number;
  createdBy!: User;

  updatedById!: number;
  updatedBy!: User;

  createdAt!: Date;

  updatedAt!: Date;

  definitions!: Definition[];

  // TODO: Do the same in Definition entity and fix all errors in proposals and dictionary UI
  examples!: WordDetailsExample[];
}
