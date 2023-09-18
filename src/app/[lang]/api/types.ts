export type Lang = 'lez' | 'rus' | 'eng' | 'tab';

export type SearchQuery = { 
  exp: string;
  fromLang: Lang,
  toLang: Lang,
}