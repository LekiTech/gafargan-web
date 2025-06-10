import React, { FC } from 'react';
// import * as expressionApi from '../../../api/expressionApi';
import {
  search,
  searchInExamples,
  searchInDefinitions,
  suggestionsFuzzy,
  searchAdvanced,
} from '@repository/word.repository';
import { ResolvingMetadata, Metadata } from 'next';
import { DictionaryLang, WebsiteLang } from '../../../../api/types.model';
import { initTranslations } from '@i18n/index';
import { ExpressionView } from './components/ExpressionView';
import { normalizeLezgiString, toLowerCaseLezgi, toNumber } from '../../../utils';
import { LangToId } from '@api/languages';
import { AdvancedSearchParams, Params, SearchParams } from '../../types';
import { redirect } from 'next/navigation';
import { AdvancedSearchResults } from './components/AdvancedSearchResults';

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
  const searchParamValues = await searchParams;
  const { fromLang, toLang, exp, adv } = searchParamValues;
  const { t } = await initTranslations(lang);

  if (adv == '1') {
    const { page, pageSize, s, c, e, tag, minl, maxl } = searchParamValues as AdvancedSearchParams;
    const paginatedWords = await searchAdvanced({
      page: toNumber(page),
      pageSize: toNumber(pageSize),
      starts: s,
      contains: c,
      ends: e,
      minLength: minl,
      maxLength: maxl,
      tag: tag,
      wordLangDialectIds: LangToId[fromLang],
      definitionsLangDialectIds: LangToId[toLang],
    });
    if (page > paginatedWords.totalPages) {
      redirect(
        `/${lang}/search/definition?` +
          Object.entries({ ...searchParamValues, page: paginatedWords.totalPages })
            .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value ?? '')}`)
            .join('&'),
      );
    }
    return <AdvancedSearchResults lang={lang} paginatedWords={paginatedWords} />;
  }

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
  const isExpressionFound = !!data && data.length > 0;

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

  console.log('data', data);

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
