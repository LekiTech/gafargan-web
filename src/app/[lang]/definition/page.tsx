import React, { FC } from 'react';
import * as expressionApi from '../../../api/expressionApi';
import { ResolvingMetadata, Metadata } from 'next';
import { DictionaryLang, WebsiteLang } from '../../../api/types.model';
import { initTranslations } from '@i18n/index';
import { ExpressionView } from './components/ExpressionView';

function expressionSpellingToLowerCase(spelling: string) {
  return spelling.toLowerCase().replaceAll('i', 'I');
}

export async function generateMetadata(
  { searchParams }: ExpressionPageProps,
  parent: ResolvingMetadata,
): Promise<Metadata> {
  // fetch data
  const data = await expressionApi.search({
    spelling: searchParams.exp,
    expLang: searchParams.fromLang as DictionaryLang,
    defLang: searchParams.toLang as DictionaryLang,
    similarCount: 0,
  });

  // optionally access and extend (rather than replace) parent metadata
  const previousImages = (await parent).openGraph?.images || [];
  const spelling = expressionSpellingToLowerCase(data?.found?.spelling || '');
  return {
    title: spelling.charAt(0).toUpperCase() + spelling.slice(1),
    description: data?.found?.details[0].definitionDetails[0]?.definitions[0]?.value,
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
  const data = await expressionApi.search({
    spelling: searchParams.exp,
    expLang: searchParams.fromLang as DictionaryLang,
    defLang: searchParams.toLang as DictionaryLang,
  });
  return (
    <ExpressionView expression={data} lang={lang} labels={{ otherExamples: t('otherExamples') }} />
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
