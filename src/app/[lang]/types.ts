import { DictionaryLang, WebsiteLang } from '@api/types.model';

export type Params = Promise<{ lang: WebsiteLang }>;
export type SearchParams = Promise<
  { fromLang: DictionaryLang; toLang: DictionaryLang; exp?: string } & Record<string, string>
>;

export type RootLayoutProps = {
  children: React.ReactNode;
  params: Params;
};
