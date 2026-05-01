import { FC } from 'react';
import { redirect } from 'next/navigation';
import { Params, SearchParams } from '@/types';
import { getSources } from '@repository/source.repository';
import { getPaginatedTranslations } from '@repository/translation.repository';
import { getPaginatedProposals } from '@repository/proposal.repository';
import { ProposalType } from '@repository/entities/enums';
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

  const [sources, translations, proposals] = await Promise.all([
    getSources(),
    getPaginatedTranslations({ page, size: pageSize }),
    getPaginatedProposals({ type: ProposalType.TRANSLATIONS, page: 1, size: 30 }),
  ]);

  if (translations.totalPages > 0 && translations.currentPage > translations.totalPages) {
    redirect(
      `/${lang}/${Routes.Translations}?` +
        Object.entries({ ...searchParamValues, page: translations.totalPages })
          .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value ?? '')}`)
          .join('&'),
    );
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
      proposals={proposals.items}
    />
  );
};

export default TranslationsPage;
