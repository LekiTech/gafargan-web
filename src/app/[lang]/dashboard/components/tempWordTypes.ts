export class Word {
  id!: number;
  spelling!: string;
  lang!: number;
  source!: Source | null;
  spellingVariants!: SpellingVariant[];
  details!: WordDetail[];
}

export class SpellingVariant {
  id!: number;
  lang!: number;
  spelling!: string;
  source!: Source | null;
}

export class WordDetail {
  id!: number;
  orderIdx!: number | null;
  inflection!: string | null;
  lang!: number;
  source!: Source | null;
  definitions!: Definition[];
  examples!: Translation[];
}

export class Definition {
  id!: number;
  values!: DefinitionValue[];
  tags!: string[];
  examples!: Translation[];
}

export interface DefinitionValue {
  value: string;
  tags?: string[];
}

export class Translation {
  id!: number;
  phrasesPerLangDialect!: Record<number, TranslationPhrases>;
  tags!: string[];
}

export interface TranslationPhrases {
  phrase: string;
  tags?: string[];
}

export interface Source {
  id: number;
  name: string;
  url?: string;
}

// Form state interfaces for easier handling
export interface WordFormData {
  spelling: string;
  lang: number;
  source?: Source;
  spellingVariants: Omit<SpellingVariant, 'id'>[];
  details: Omit<WordDetail, 'id'>[];
}
