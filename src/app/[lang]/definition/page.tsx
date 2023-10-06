import React, { FC, use } from 'react';
import images from '@/store/images';
import expressionApi from '@/api/expression';
import { ResolvingMetadata, Metadata } from 'next';
import { DictionaryLang, WebsiteLang } from '@/api/types';
import { Box, Stack, Typography } from '@mui/material';
import { Sidebar } from './components/Sidebar';
import { expressionFont } from '@/fonts';
import ExpressionDetailsComp from './components/ExpressionDetailsComp';
import { toContents } from './utils';
import { useTranslation } from '@i18n/index';

function expressionSpellingToLowerCase(spelling: string) {
  return spelling.toLowerCase().replaceAll('i', 'I');
}

export async function generateMetadata(
  { searchParams }: ExpressionPageProps,
  parent: ResolvingMetadata,
): Promise<Metadata> {
  // fetch data
  const data = await expressionApi.testSearch({
    exp: searchParams.exp,
    fromLang: searchParams.fromLang as DictionaryLang,
    toLang: searchParams.toLang as DictionaryLang,
  });

  // optionally access and extend (rather than replace) parent metadata
  const previousImages = (await parent).openGraph?.images || [];
  const spelling = expressionSpellingToLowerCase(data.spelling);
  return {
    title: spelling.charAt(0).toUpperCase() + spelling.slice(1),
    description: data.details[0].definitionDetails[0].definitions[0].value,
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
  // const {props} = use(getServerSideProps());
  // const { data } = useSearchExpressionQuery('къил');
  const { t } = await useTranslation(lang);
  const data = await //use(
  expressionApi.testSearch({
    exp: searchParams.exp,
    fromLang: searchParams.fromLang as DictionaryLang,
    toLang: searchParams.toLang as DictionaryLang,
  });
  //);
  // const dictionary = useSelector((state: any): DictionaryReduxState => state.dictionary);
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
      }}
    >
      <Stack
        direction={'row'}
        spacing={2}
        sx={{
          maxWidth: '1400px',
        }}
      >
        <Sidebar
          contents={data.details.map((d, i) => toContents(i, data.spelling, d))}
          otherExamplesLabel={t('otherExamples')}
        />
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'left',
            justifyContent: 'center',
            width: '100vw',
            pt: '25px',
            pl: '25px',
            pb: '50px',
          }}
        >
          {/* BELOW is implementation for a SINGLE expression detail */}
          {data.details.map((detail, i) => (
            <ExpressionDetailsComp
              key={`exp_det_${i}`}
              idx={i}
              lang={lang}
              spelling={data.spelling}
              data={detail}
              isLast={i === data.details.length - 1}
            />
          ))}
        </Box>
      </Stack>
    </Box>
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
