import { FC } from 'react';
import { redirect } from 'next/navigation';
import { Params, SearchParams } from '@/types';
import { getSources } from '@repository/source.repository';
import {
  getPaginatedTranslations,
} from '@repository/translation.repository';
import { getPaginatedProposals } from '@repository/proposal.repository';
import { ProposalStatus, ProposalType } from '@repository/entities/enums';
import { SourceModelType, STATE } from '../models/proposal.model';
import TranslationsDashboard from './translations-dashboard';
import { toNumber } from '../../../utils';
import { Routes } from '../../../routes';

const TranslationsPage: FC<{ params: Params; searchParams: SearchParams }> = async ({
  params,
  searchParams,
}) => {
  const { lang } = await params;
  const searchParamValues = await searchParams;
  const page = toNumber(searchParamValues.page || 1);
  const pageSize = toNumber(searchParamValues.pageSize || 20);
  const proposalsPage = toNumber(searchParamValues.proposalsPage || 1);
  const proposalsPageSize = toNumber(searchParamValues.proposalsPageSize || 5);
  const proposalsHistoryPage = toNumber(searchParamValues.proposalsHistoryPage || 1);
  const proposalsHistoryPageSize = toNumber(searchParamValues.proposalsHistoryPageSize || 5);

  const historyStatuses = [ProposalStatus.APPROVED, ProposalStatus.REJECTED];
  const [sources, translations, proposals, proposalsHistory] = await Promise.all([
    getSources(),
    getPaginatedTranslations({ page, size: pageSize }),
    getPaginatedProposals({
      type: ProposalType.TRANSLATIONS,
      status: ProposalStatus.PENDING,
      page: proposalsPage,
      size: proposalsPageSize,
    }),
    getPaginatedProposals({
      type: ProposalType.TRANSLATIONS,
      status: historyStatuses,
      page: proposalsHistoryPage,
      size: proposalsHistoryPageSize,
    }),
  ]);

  if (translations.totalPages > 0 && translations.currentPage > translations.totalPages) {
    redirect(
      `/${lang}/${Routes.Translations}?` +
        Object.entries({ ...searchParamValues, page: translations.totalPages })
          .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value ?? '')}`)
          .join('&'),
    );
  }
  const proposalRedirectEntries = [
    ['proposalsPage', proposals],
    ['proposalsHistoryPage', proposalsHistory],
  ] as const;
  for (const [paramName, paginatedProposals] of proposalRedirectEntries) {
    if (
      paginatedProposals.totalPages > 0 &&
      paginatedProposals.currentPage > paginatedProposals.totalPages
    ) {
      redirect(
        `/${lang}/${Routes.Translations}?` +
          Object.entries({ ...searchParamValues, [paramName]: paginatedProposals.totalPages })
            .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value ?? '')}`)
            .join('&'),
      );
    }
  }

  const sourceModels: SourceModelType[] = sources.map((source) => ({
    state: STATE.UNCHANGED,
    id: source.id,
    name: source.name,
    authors: source.authors ?? undefined,
  }));

  return (
    <TranslationsDashboard
      lang={lang}
      translations={translations}
      sourceModels={sourceModels}
      proposals={proposals}
      proposalsHistory={proposalsHistory}
    />
  );
};

export default TranslationsPage;
