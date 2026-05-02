import { FC } from 'react';
import { redirect } from 'next/navigation';
import { Params, SearchParams } from '@/types';
import { getSources } from '@repository/source.repository';
import { getPaginatedProposals } from '@repository/proposal.repository';
import { ProposalStatus, ProposalType } from '@repository/entities/enums';
import { mapSourceToModelType } from '../models/proposal.mapper';
import { toNumber } from '../../../utils';
import { Routes } from '../../../routes';
import SourcesDashboard from './sources-dashboard';

const SourcesPage: FC<{ params: Params; searchParams: SearchParams }> = async ({
  params,
  searchParams,
}) => {
  const { lang } = await params;
  const searchParamValues = await searchParams;
  const proposalsPage = toNumber(searchParamValues.proposalsPage || 1);
  const proposalsPageSize = toNumber(searchParamValues.proposalsPageSize || 5);
  const proposalsHistoryPage = toNumber(searchParamValues.proposalsHistoryPage || 1);
  const proposalsHistoryPageSize = toNumber(searchParamValues.proposalsHistoryPageSize || 5);

  const [sources, proposals, proposalsHistory] = await Promise.all([
    getSources(),
    getPaginatedProposals({
      type: ProposalType.SOURCE,
      status: ProposalStatus.PENDING,
      page: proposalsPage,
      size: proposalsPageSize,
    }),
    getPaginatedProposals({
      type: ProposalType.SOURCE,
      status: [ProposalStatus.APPROVED, ProposalStatus.REJECTED],
      page: proposalsHistoryPage,
      size: proposalsHistoryPageSize,
    }),
  ]);

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
        `/${lang}/${Routes.Sources}?` +
          Object.entries({ ...searchParamValues, [paramName]: paginatedProposals.totalPages })
            .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value ?? '')}`)
            .join('&'),
      );
    }
  }

  return (
    <SourcesDashboard
      lang={lang}
      sources={sources.map(mapSourceToModelType)}
      proposals={proposals}
      proposalsHistory={proposalsHistory}
    />
  );
};

export default SourcesPage;
