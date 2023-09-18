import React, { FC, use } from 'react';
// import '@/i18n';
import images from '@/store/images';
import { useSearchExpressionQuery } from '@/store/expression';
import expressionApi from '@/api/expression';
import { ResolvingMetadata, Metadata } from 'next';
import { Lang } from '@/api/types';

export async function generateMetadata(
  { searchParams }: ExpressionPageProps,
  parent: ResolvingMetadata
): Promise<Metadata> {

  // fetch data
  const data = await expressionApi.search({
    exp: searchParams.exp,
    fromLang: searchParams.fromLang as Lang,
    toLang: searchParams.toLang as Lang,
  });
 
  // optionally access and extend (rather than replace) parent metadata
  const previousImages = (await parent).openGraph?.images || []
  const spelling = data[0].spelling;
  return {
    title: spelling.charAt(0).toUpperCase() + spelling.slice(1),
    description: data[0].definitions[0].text,
    // openGraph: {
    //   images: ['/some-specific-page-image.jpg', ...previousImages],
    // },
  }
}

const colors = {
  primary: '#0f3b2e',
  primaryTint: '#132e05',
  secondary: '#bb1614',
  secondaryTint: '#810000',
}

type ExpressionPageProps = { 
  params: { lang: string },
  // replace `exp` with `eid`
  searchParams: { fromLang: string, toLang: string, exp: string },
};

const ExpressionPage: FC<ExpressionPageProps> = ({ searchParams }) => {
  // const {props} = use(getServerSideProps());
  // const { data } = useSearchExpressionQuery('къил');
  const data = use(expressionApi.search({
    exp: searchParams.exp,
    fromLang: searchParams.fromLang as Lang,
    toLang: searchParams.toLang as Lang,
  }));
  // const dictionary = useSelector((state: any): DictionaryReduxState => state.dictionary);
  return (
    <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '100vw'}}>
      <h1>Props</h1>
      <pre style={{width: '100%'}}>
        <code>{JSON.stringify(searchParams, null, 2)}</code>
      </pre>
      <br />
      <h1>Search result</h1>
      <pre style={{width: '100%'}}>
        <code>{JSON.stringify(data, null, 2)}</code>
      </pre>
    </div>
  );
}

export default ExpressionPage;

// This gets called on every request
async function getServerSideProps() {
  // Fetch data from external API
  const res = await fetch(`https://api.gafalag.com/expression/search?exp=руш&fromLang=lez&toLang=rus`)
  const data = await res.json()
 
  // Pass data to the page via props
  return { props: { data } }
}