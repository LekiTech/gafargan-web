import React, { FC } from 'react';
// import * as expressionApi from '../../../api/expressionApi';
import {
  search,
  searchInExamples,
  suggestions,
  searchInDefinitions,
} from '@repository/word.repository';
import { ResolvingMetadata, Metadata } from 'next';
import { DictionaryLang, WebsiteLang } from '../../../api/types.model';
import { initTranslations } from '@i18n/index';
import { ExpressionView } from './components/ExpressionView';
import { toLowerCaseLezgi } from '../../utils';
import { LangToId } from '@api/languages';

export async function generateMetadata(
  { params, searchParams }: ExpressionPageProps,
  parent: ResolvingMetadata,
): Promise<Metadata> {
  const { t } = await initTranslations(params.lang);
  // fetch data
  const searchQuery = {
    spelling: searchParams.exp,
    wordLangDialectId: LangToId[searchParams.fromLang],
    definitionsLangDialectId: LangToId[searchParams.toLang],
  };
  const data = await search(searchQuery);

  if (!data) {
    const similarWords = await suggestions(searchQuery);
    const title = t('meta.title');
    const description = t('probablyYouMeant') + ' ' + similarWords.join(', ');
    return {
      title,
      description,
      openGraph: {
        title,
        description,
      },
    };
  }

  // optionally access and extend (rather than replace) parent metadata
  const previousImages = (await parent).openGraph?.images || [];
  const spelling = toLowerCaseLezgi(data?.spelling || '', { capitalize: true });
  return {
    title: `${spelling && `"${spelling}"`} ${t('languages.' + searchParams.fromLang)} - ${t(
      'languages.' + searchParams.toLang,
    )} ${t('translation').toLowerCase()}`, //.charAt(0).toUpperCase() + spelling.slice(1),
    description:
      data?.details[0].definitions[0]?.values[0].value?.replaceAll(/\{|}|<[^>]*>/g, '') || '',
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
  const data = await search({
    spelling: searchParams.exp,
    wordLangDialectId: LangToId[fromLang],
    definitionsLangDialectId: LangToId[toLang],
  });

  const similarWords = data?.details
    ? []
    : await suggestions({
        spelling: searchParams.exp,
        wordLangDialectId: LangToId[fromLang],
        definitionsLangDialectId: LangToId[toLang],
        limit: 5,
      });

  // true if found, false if not
  const isExpressionFound = !!data;
  const foundInExamples = isExpressionFound
    ? undefined
    : await searchInExamples({
        spelling: searchParams.exp,
        wordLangDialectId: LangToId[fromLang],
        definitionsLangDialectId: LangToId[toLang],
      });

  const foundInDefinitions = isExpressionFound
    ? undefined
    : await searchInDefinitions({
        spelling: searchParams.exp,
        wordLangDialectId: LangToId[fromLang],
        definitionsLangDialectId: LangToId[toLang],
      });
  // const foundInExamples = isExpressionFound
  //   ? undefined
  //   : await expressionApi.examples({
  //       searchString: searchParams.exp,
  //       lang1: fromLang,
  //       lang2: toLang,
  //       pageSize: 10,
  //       currentPage: 0,
  //       // tags: ['сущ.'],
  //     });
  // const foundInDefinitions = isExpressionFound
  //   ? undefined
  //   : await expressionApi.definitions({
  //       searchString: searchParams.exp,
  //       expLang: fromLang,
  //       defLang: toLang,
  //       pageSize: 10,
  //       currentPage: 0,
  //       // tags: ['сущ.'],
  //     });
  return (
    // <pre>{JSON.stringify(data, null, 2)}</pre>
    <ExpressionView
      foundInExamples={foundInExamples}
      foundInDefinitions={foundInDefinitions}
      word={data}
      similarWords={similarWords}
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
