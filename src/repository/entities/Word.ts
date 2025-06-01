import { LangDialect } from './LangDialect';
import { User } from './User';
import type { SpellingVariant } from './SpellingVariant';
import type { WordDetail } from './WordDetail';
import type { Source } from './Source';

export class Word {
  id!: number;

  spelling!: string;

  langDialect!: LangDialect;

  source!: Source | null;

  createdBy!: User;

  updatedBy!: User;

  createdAt!: Date;

  updatedAt!: Date;

  spellingVariants!: SpellingVariant[];

  details!: WordDetail[];
}
