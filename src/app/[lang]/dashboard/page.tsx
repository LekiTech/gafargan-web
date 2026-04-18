import { FC } from 'react';
import { searchAdvanced } from '@repository/word.repository';
import { getSources } from '@repository/source.repository';
import { redirect } from 'next/navigation';
import { Routes } from '../../routes';
import { AdvancedSearchParams, Params, SearchParams } from '@/types';
import { FoundDefinitionsList } from './dictionary/components/FoundDefinitionsList';
import { initTranslations } from '@i18n/index';
import { LangToId } from '@api/languages';
import { toNumber } from '../../utils';
import { PaginatedResponse } from '@repository/types.model';
import { SourceModelType, STATE, WordModelExistingNestedType } from './models/proposal.model';
import { mapWordToModelNestedType } from './models/proposal.mapper';

const Dashboard: FC<{ params: Params; searchParams: SearchParams }> = async ({
  params,
  searchParams,
}) => {
  const { lang } = await params;
  const searchParamValues = await searchParams;
  const { fromLang, toLang, page, pageSize, s, c, e, tag, minl, maxl } =
    searchParamValues as AdvancedSearchParams;
  const { t } = await initTranslations(lang);

  const paginatedWords = await searchAdvanced({
    page: toNumber(page || 0),
    pageSize: toNumber(pageSize || 10),
    starts: s,
    contains: c,
    ends: e,
    minLength: minl,
    maxLength: maxl,
    tag: tag,
    wordLangDialectIds: LangToId[fromLang || 'lez'],
    definitionsLangDialectIds: LangToId[toLang || 'rus'],
  });
  if (page > paginatedWords.totalPages) {
    redirect(
      `/${lang}/dashboard?` +
        Object.entries({ ...searchParamValues, page: paginatedWords.totalPages })
          .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value ?? '')}`)
          .join('&'),
    );
  }

  const paginatedWordsModel: PaginatedResponse<WordModelExistingNestedType> = {
    ...paginatedWords,
    items: paginatedWords.items.map(mapWordToModelNestedType),
  };

  // Temporary disabled in prod until finishd with development
  if (process.env.NODE_ENV === 'production') {
    redirect(`/${lang}/${Routes.UserSearchPage}`);
  }
  const sources = await getSources();
  const sourceModels: SourceModelType[] = sources.map((source) => {
    return {
      state: STATE.UNCHANGED,
      id: source.id,
      name: source.name,
      authors: source.authors ?? undefined,
      // publicationYear: source.publicationYear ?? undefined,
      // providedBy: source.providedBy ?? undefined,
      // providedByUrl: source.providedByUrl ?? undefined,
      // processedBy: source.processedBy ?? undefined,
      // copyright: source.copyright ?? undefined,
      // seeSourceUrl: source.seeSourceUrl ?? undefined,
      // description: source.description ?? undefined,
    };
  });

  return (
    <FoundDefinitionsList
      lang={lang}
      paginatedWords={paginatedWordsModel}
      sourceModels={sourceModels}
    />
  );
};

export default Dashboard;
