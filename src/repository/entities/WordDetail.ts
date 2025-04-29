import { Word } from './Word';
import { LangDialect } from './LangDialect';
import { Source } from './Source';
import { User } from './User';
import type { Definition } from './Definition';
import { Translation } from './Translation';

export class WordDetail {
  id!: number;

  word!: Word;

  orderIdx!: number | null;

  inflection!: string | null;

  langDialect!: LangDialect;

  source!: Source | null;

  createdBy!: User;

  updatedBy!: User;

  createdAt!: Date;

  updatedAt!: Date;

  definitions!: Definition[];

  examples!: Translation[];
}
