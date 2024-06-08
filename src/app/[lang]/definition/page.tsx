import React, { FC } from 'react';
import * as expressionApi from '../../../api/expressionApi';
import { ResolvingMetadata, Metadata } from 'next';
import { DictionaryLang, WebsiteLang } from '../../../api/types.model';
import { initTranslations } from '@i18n/index';
import { ExpressionView } from './components/ExpressionView';
import { toLowerCaseLezgi } from '../../utils';

export async function generateMetadata(
  { params, searchParams }: ExpressionPageProps,
  parent: ResolvingMetadata,
): Promise<Metadata> {
  const { t } = await initTranslations(params.lang);
  // fetch data
  const data = await expressionApi.search({
    spelling: searchParams.exp,
    expLang: searchParams.fromLang as DictionaryLang,
    defLang: searchParams.toLang as DictionaryLang,
    similarCount: 0,
  });

  // optionally access and extend (rather than replace) parent metadata
  const previousImages = (await parent).openGraph?.images || [];
  const spelling = toLowerCaseLezgi(data?.found?.spelling || '', { capitalize: true });
  return {
    title: `"${spelling}" ${t('languages.' + searchParams.fromLang)} - ${t(
      'languages.' + searchParams.toLang,
    )} ${t('translation').toLowerCase()}`, //.charAt(0).toUpperCase() + spelling.slice(1),
    description:
      data?.found?.details[0].definitionDetails[0]?.definitions[0]?.value.replaceAll(
        /\{|}|<[^>]*>/g,
        '',
      ) || '',
    // openGraph: {
    //   images: ['/some-specific-page-image.jpg', ...previousImages],
    // },
  };
}

type ExpressionPageProps = {
  params: { lang: WebsiteLang };
  // replace `exp` with `expId`
  searchParams: { fromLang: string; toLang: string; exp: string };
};

const ExpressionPage: FC<ExpressionPageProps> = async ({ params: { lang }, searchParams }) => {
  const { t } = await initTranslations(lang);
  const fromLang = searchParams.fromLang as DictionaryLang;
  const toLang = searchParams.toLang as DictionaryLang;
  const data = await expressionApi.search({
    spelling: searchParams.exp,
    expLang: fromLang,
    defLang: toLang,
  });
  // true if found, false if not
  const isExpressionFound = !!data?.found;
  const foundInExamples = isExpressionFound
    ? undefined
    : await expressionApi.examples({
        searchString: searchParams.exp,
        lang1: fromLang,
        lang2: toLang,
        pageSize: 10,
        currentPage: 0,
        // tags: ['сущ.'],
      });
  const foundInDefinitions = isExpressionFound
    ? undefined
    : await expressionApi.definitions({
        searchString: searchParams.exp,
        expLang: fromLang,
        defLang: toLang,
        pageSize: 10,
        currentPage: 0,
        // tags: ['сущ.'],
      });
  return (
    <ExpressionView
      foundInExamples={foundInExamples?.items ?? []}
      foundInDefinitions={foundInDefinitions?.items ?? []}
      expression={data}
      lang={lang}
      labels={{ otherExamples: t('otherExamples') }}
    />
  );
};

export default ExpressionPage;

// This gets called on every request
async function getServerSideProps() {
  // Fetch data from external API
  const res = await fetch(
    `https://api.gafalag.com/expression/search?exp=руш&fromLang=lez&toLang=rus`,
  );
  const data = await res.json();

  // Pass data to the page via props
  return { props: { data } };
}
