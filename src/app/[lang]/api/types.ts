import { DictionaryLangs, WebsiteLangs } from '../store/constants';

export type WebsiteLang = (typeof WebsiteLangs)[number];
export type DictionaryLang = (typeof DictionaryLangs)[number];
//'lez' | 'rus' | 'eng' | 'tab';

export type SearchQuery = {
  exp: string;
  fromLang: DictionaryLang;
  toLang: DictionaryLang;
};

// RESPONSES
export type Example = { raw: string; src?: string; trl?: string; tags?: string[] };

export type Definition = { value: string; tags?: string[] };

export type DefinitionDetails = {
  definitions: Definition[];
  examples?: Example[];
  /** tags applicable to all `definitions` and `examples` */
  tags?: string[];
};

export type ExpressionDetails = {
  // grammatical forms of the expression
  gr?: string;
  inflection?: string;
  definitionDetails: DefinitionDetails[];
  examples?: Example[];
};

export type Expression = {
  spelling: string;
  details: ExpressionDetails[];
};

export type WrittenSource = {
  name: string;
  authors?: string;
  publicationYear?: string;
  description?: string;
  providedBy?: string;
  providedByURL?: string;
  processedBy?: string;
  copyright?: string;
  seeSourceURL?: string;
  expressionLanguageId: string;
  definitionLanguageId: string;
};
