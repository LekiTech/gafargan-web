import { Language } from './enums';
import type { Word } from './Word';
import type { WordDetail } from './WordDetail';
import type { SpellingVariant } from './SpellingVariant';

export class LangDialect {
  id!: number;

  language!: Language;

  dialect!: string;

  createdAt!: Date;

  updatedAt!: Date;

  words!: Word[];

  wordDetails!: WordDetail[];

  spellingVariants!: SpellingVariant[];
}
