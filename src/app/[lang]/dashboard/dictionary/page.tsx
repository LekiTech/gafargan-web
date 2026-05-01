import { FC } from 'react';
import { redirect } from 'next/navigation';
import {
  getWordsByIds,
  getWordsHistoryByIds,
  searchAdvanced,
  WordHistorySnapshot,
} from '@repository/word.repository';
import { Routes } from '../../../routes';
import { AdvancedSearchParams, Params, SearchParams } from '@/types';
import { LangToId } from '@api/languages';
import { toNumber } from '../../../utils';
import TabsContent from './components/TabsContent';
import { getSources } from '@repository/source.repository';
import { SourceModelType, STATE, WordModelExistingNestedType } from '../models/proposal.model';
import { getPaginatedProposals } from '@repository/proposal.repository';
import { ProposalStatus, ProposalType } from '@repository/entities/enums';
import { mapWordToModelNestedType } from '../models/proposal.mapper';
import { PaginatedResponse } from '@repository/types.model';

const mapHistoryWordToModelNestedType = (
  word: WordHistorySnapshot,
): WordModelExistingNestedType => ({
  ...word,
  state: STATE.UNCHANGED,
});

const DictionaryPage: FC<{ params: Params; searchParams: SearchParams }> = async ({
  params,
  searchParams,
}) => {
  const { lang } = await params;
  const searchParamValues = await searchParams;
  const { fromLang, toLang, page, pageSize, s, c, e, tag, minl, maxl } =
    searchParamValues as AdvancedSearchParams;

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
  const paginatedWordsModel: PaginatedResponse<WordModelExistingNestedType> = {
    ...paginatedWords,
    items: paginatedWords.items.map(mapWordToModelNestedType),
  };
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
    size: 30,
  });
  const currentBaselineWordIds = proposals.flatMap((proposal) => {
    if (proposal.status !== ProposalStatus.PENDING) {
      return [];
    }
    const data = proposal.data as { entries?: { id?: number; state?: string }[] } | null;
    return (
      data?.entries
        ?.filter((entry) => entry.id && entry.state !== STATE.ADDED)
        .map((entry) => entry.id!) ?? []
    );
  });

  const proposalHistoryBaselineEntries = await Promise.all(
    proposals
      .filter((proposal) => proposal.status !== ProposalStatus.PENDING && proposal.reviewedAt)
      .map(async (proposal) => {
        const data = proposal.data as { entries?: { id?: number; state?: string }[] } | null;
        const wordIds =
          data?.entries
            ?.filter((entry) => entry.id && entry.state !== STATE.ADDED)
            .map((entry) => entry.id!) ?? [];
        const historyWords = await getWordsHistoryByIds(wordIds, new Date(proposal.reviewedAt!));
        return [
          proposal.id,
          Object.fromEntries(
            historyWords.map((word) => [word.id, mapHistoryWordToModelNestedType(word)]),
          ),
        ] as const;
      }),
  );

  const proposalBaselineWords = await getWordsByIds(currentBaselineWordIds);
  const currentBaselineWordModels = Object.fromEntries(
    proposalBaselineWords.map((word) => [word.id, mapWordToModelNestedType(word)]),
  );
  const proposalBaselineWordModels = Object.fromEntries(
    proposals.map((proposal) => {
      const historyBaseline = proposalHistoryBaselineEntries.find(([id]) => id === proposal.id);
      return [proposal.id, historyBaseline ? historyBaseline[1] : currentBaselineWordModels];
    }),
  );

  return (
    <TabsContent
      lang={lang}
      paginatedWords={paginatedWordsModel}
      sourceModels={sourceModels}
      proposals={proposals}
      proposalBaselineWords={proposalBaselineWordModels}
    />
  );
};

export default DictionaryPage;
