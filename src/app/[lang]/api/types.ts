import { DictionaryLangs, WebsiteLangs } from './constants';

export type WebsiteLang = (typeof WebsiteLangs)[number];
export type DictionaryLang = (typeof DictionaryLangs)[number];
//'lez' | 'rus' | 'eng' | 'tab';

export type SearchQuery = {
  exp: string;
  fromLang: DictionaryLang;
  toLang: DictionaryLang;
};
