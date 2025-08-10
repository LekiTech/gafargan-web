import { FC } from 'react';
import { redirect } from 'next/navigation';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import { getPaginatedWords, searchAdvanced } from '@repository/word.repository';
import { Routes } from '../../../routes';
import { AdvancedSearchParams, Params, SearchParams } from '@/types';
import { FoundDefinitionsList } from './components/FoundDefinitionsList';
import { initTranslations } from '@i18n/index';
import { LangToId } from '@api/languages';
import { toNumber } from '../../../utils';
import TabsContent from './components/TabsContent';
import { getSources } from '@repository/source.repository';
import { DictionaryProposalModel, SourceModelType, STATE } from '../models/proposal.model';
import { getPaginatedProposals } from '@repository/proposal.repository';
import { ProposalType } from '@repository/entities/enums';

const DictionaryPage: FC<{ params: Params; searchParams: SearchParams }> = async ({
  params,
  searchParams,
}) => {
  const { lang } = await params;
  const searchParamValues = await searchParams;
  const { fromLang, toLang, page, pageSize, s, c, e, tag, minl, maxl } =
    searchParamValues as AdvancedSearchParams;
  const { t } = await initTranslations(lang);

  // Temporary disabled in prod until finishd with development
  if (process.env.NODE_ENV === 'production') {
    redirect(`/${lang}/${Routes.UserSearchPage}`);
  }

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
      `/${lang}/${Routes.Dictionary}?` +
        Object.entries({ ...searchParamValues, page: paginatedWords.totalPages })
          .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value ?? '')}`)
          .join('&'),
    );
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
  const proposals = await getPaginatedProposals({
    type: ProposalType.DICTIONARY,
    page: 0,
    size: 10,
  });
  return (
    <TabsContent
      lang={lang}
      paginatedWords={paginatedWords}
      sourceModels={sourceModels}
      proposals={proposals}
    />
  );
};

export default DictionaryPage;
