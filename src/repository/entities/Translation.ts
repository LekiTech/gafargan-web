import { User } from './User';

export class Translation {
  id!: number;

  phrasesPerLangDialect!: Record<string, TranslationPhrases>;

  tags!: string[];

  raw!: string | null;

  createdBy!: User;

  updatedBy!: User;

  createdAt!: Date;

  updatedAt!: Date;
}
//  For now this one is unnecessary complex, we can use the latter implementation without huge losses in UX
// export interface TranslationPhrases {
//   /**
//    * Here "phrase" is a word, phrase, or a sentence
//    * It is an array because there could be multiple ways to formulate the same meaning
//    */
//   phrases: { phrase: string; tags?: string[] }[];
//   tags?: string[];
// }
export interface TranslationPhrases {
  phrase: string;
  tags?: string[];
}
