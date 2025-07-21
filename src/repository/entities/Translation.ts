import { User } from './User';

export class Translation {
  id!: number;
  /*
  TODO: Convert to the following structure:
  phrasesPerLangDialect: {
    [langDialect: LangDialect]: [
      {
        phrase: string,
        tags?: string[],
      }
    ]
  }
  NOTE: this way we will be able to provide multiple translation for the same sentence, and tag each of them separately
        For example we could have 2 translations for the same sentence, one with a literal meaning, and another with a more idiomatic meaning
  */
  phrasesPerLangDialect!: Record<string, TranslationPhrase[]>;

  tags!: string[];

  raw!: string | null;

  createdBy!: User;

  updatedBy!: User;

  createdAt!: Date;

  updatedAt!: Date;
}

export interface TranslationPhrase {
  phrase: string;
  tags?: string[];
}
