import React, { FC } from 'react';
// import * as expressionApi from '../../../api/expressionApi';
import {
  search,
  searchInExamples,
  searchInDefinitions,
  suggestionsFuzzy,
} from '@repository/word.repository';
import { ResolvingMetadata, Metadata } from 'next';
import { DictionaryLang, WebsiteLang } from '../../../../api/types.model';
import { initTranslations } from '@i18n/index';
import { ExpressionView } from './components/ExpressionView';
import { normalizeLezgiString, toLowerCaseLezgi } from '../../../utils';
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
    wordLangDialectIds: LangToId[fromLang],
    definitionsLangDialectIds: LangToId[toLang],
  };
  const data = await search(searchQuery);

  if (!data) {
    const similarWords = await suggestionsFuzzy(searchQuery);
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
  const spelling = toLowerCaseLezgi(data?.[0]?.spelling || '', { capitalize: true });
  return {
    title: `${spelling && `"${spelling}"`} ${t('languages.' + fromLang)} - ${t(
      'languages.' + toLang,
    )} ${t('translation').toLowerCase()}`, //.charAt(0).toUpperCase() + spelling.slice(1),
    description:
      data?.[0]?.details[0].definitions[0]?.values[0].value?.replaceAll(/\{|}|<[^>]*>/g, '') || '',
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
  const normalizedExpValue = normalizeLezgiString(exp, { removePunctuation: false });
  console.log('normalizedExpValue', normalizedExpValue);
  // const fromLang = fromLang as DictionaryLang;
  // const toLang = toLang as DictionaryLang;
  const data = await search({
    spelling: normalizedExpValue,
    wordLangDialectIds: LangToId[fromLang],
    definitionsLangDialectIds: LangToId[toLang],
  });

  // true if found, false if not
  const isExpressionFound = !!data;

  const similarWords = isExpressionFound
    ? []
    : await suggestionsFuzzy({
        spelling: normalizedExpValue,
        wordLangDialectIds: LangToId[fromLang],
        definitionsLangDialectIds: LangToId[toLang],
        limit: 5,
      });

  const foundInExamples = isExpressionFound
    ? undefined
    : await searchInExamples({
        spelling: normalizedExpValue,
        wordLangDialectIds: LangToId[fromLang],
        definitionsLangDialectIds: LangToId[toLang],
        limit: 100,
      });

  const foundInDefinitions = isExpressionFound
    ? undefined
    : await searchInDefinitions({
        spelling: normalizedExpValue,
        wordLangDialectIds: LangToId[fromLang],
        definitionsLangDialectIds: LangToId[toLang],
        limit: 100,
      });

  return (
    <>
      <ExpressionView
        foundInExamples={foundInExamples}
        foundInDefinitions={foundInDefinitions}
        words={data}
        similarWords={similarWords}
        lang={lang}
        labels={{ otherExamples: t('otherExamples') }}
      />
    </>
  );
};

export default ExpressionPage;
