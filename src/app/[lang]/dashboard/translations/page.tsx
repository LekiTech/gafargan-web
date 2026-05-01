import { FC } from 'react';
import { Params, SearchParams } from '@/types';
import { getSources } from '@repository/source.repository';
import { getPaginatedTranslations } from '@repository/translation.repository';
import { getPaginatedProposals } from '@repository/proposal.repository';
import { ProposalType } from '@repository/entities/enums';
import { SourceModelType, STATE } from '../models/proposal.model';
import TranslationsDashboard from './translations-dashboard';
import { toNumber } from '../../../utils';

const TranslationsPage: FC<{ params: Params; searchParams: SearchParams }> = async ({
  params,
  searchParams,
}) => {
  const { lang } = await params;
  const searchParamValues = await searchParams;
  const page = toNumber(searchParamValues.page || 1);
  const pageSize = toNumber(searchParamValues.pageSize || 20);

  const [sources, translations, proposals] = await Promise.all([
    getSources(),
    getPaginatedTranslations({ page, size: pageSize }),
    getPaginatedProposals({ type: ProposalType.TRANSLATIONS, page: 0, size: 30 }),
  ]);

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
    />
  );
};

export default TranslationsPage;
