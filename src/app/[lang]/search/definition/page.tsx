import React, { FC } from 'react';
// import * as expressionApi from '../../../api/expressionApi';
import {
  search,
  searchInExamples,
  suggestions,
  searchInDefinitions,
} from '@repository/word.repository';
import { ResolvingMetadata, Metadata } from 'next';
import { DictionaryLang, WebsiteLang } from '../../../../api/types.model';
import { initTranslations } from '@i18n/index';
import { ExpressionView } from './components/ExpressionView';
import { toLowerCaseLezgi } from '../../../utils';
import { LangToId } from '@api/languages';
import { Params, SearchParams } from '../../types';
import { redirect } from 'next/navigation';

export async function generateMetadata(
  { params, searchParams }: ExpressionPageProps,
  parent: ResolvingMetadata,
): Promise<Metadata> {
  const { lang } = await params;
  const { fromLang, toLang, exp } = await searchParams;
  const { t } = await initTranslations(lang);
  if (exp == undefined) {
    return {};
  }
  // fetch data
  const searchQuery = {
    spelling: exp,
    wordLangDialectId: LangToId[fromLang],
    definitionsLangDialectId: LangToId[toLang],
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
    title: `${spelling && `"${spelling}"`} ${t('languages.' + fromLang)} - ${t(
      'languages.' + toLang,
    )} ${t('translation').toLowerCase()}`, //.charAt(0).toUpperCase() + spelling.slice(1),
    description:
      data?.details[0].definitions[0]?.values[0].value?.replaceAll(/\{|}|<[^>]*>/g, '') || '',
    // openGraph: {
    //   images: ['/some-specific-page-image.jpg', ...previousImages],
    // },
  };
}

type ExpressionPageProps = {
  params: Params;
  // replace `exp` with `expId`
  searchParams: SearchParams; //{ fromLang: string; toLang: string; exp: string };
};

const ExpressionPage: FC<ExpressionPageProps> = async ({ params, searchParams }) => {
  const { lang } = await params;
  const { fromLang, toLang, exp } = await searchParams;
  const { t } = await initTranslations(lang);

  if (exp == undefined) {
    redirect(`/${lang}`);
    return;
  }
  // const fromLang = fromLang as DictionaryLang;
  // const toLang = toLang as DictionaryLang;
  const data = await search({
    spelling: exp,
    wordLangDialectId: LangToId[fromLang],
    definitionsLangDialectId: LangToId[toLang],
  });

  const similarWords = data?.details
    ? []
    : await suggestions({
        spelling: exp,
        wordLangDialectId: LangToId[fromLang],
        definitionsLangDialectId: LangToId[toLang],
        limit: 5,
      });

  // true if found, false if not
  const isExpressionFound = !!data;
  const foundInExamples = isExpressionFound
    ? undefined
    : await searchInExamples({
        spelling: exp,
        wordLangDialectId: LangToId[fromLang],
        definitionsLangDialectId: LangToId[toLang],
      });

  const foundInDefinitions = isExpressionFound
    ? undefined
    : await searchInDefinitions({
        spelling: exp,
        wordLangDialectId: LangToId[fromLang],
        definitionsLangDialectId: LangToId[toLang],
      });
  // const foundInExamples = isExpressionFound
  //   ? undefined
  //   : await expressionApi.examples({
  //       searchString: exp,
  //       lang1: fromLang,
  //       lang2: toLang,
  //       pageSize: 10,
  //       currentPage: 0,
  //       // tags: ['сущ.'],
  //     });
  // const foundInDefinitions = isExpressionFound
  //   ? undefined
  //   : await expressionApi.definitions({
  //       searchString: exp,
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
