import { DictionaryLang, WebsiteLang } from '@api/types.model';

export type Params = Promise<{ lang: WebsiteLang }>;

export interface BasicSearchParams {
  fromLang: DictionaryLang;
  toLang: DictionaryLang;
  exp?: string;
}

export interface AdvancedSearchParams {
  adv: '1';
  fromLang: DictionaryLang;
  toLang: DictionaryLang;
  page: number;
  pageSize: number;
  s?: string;
  c?: string;
  e?: string;
  minl?: number;
  maxl?: number;
  tag?: string;
}

export type SearchParams = Promise<
  (BasicSearchParams & Record<string, string>) | (AdvancedSearchParams & Record<string, string>)
>;

export type RootLayoutProps = {
  children: React.ReactNode;
  params: Params;
};
