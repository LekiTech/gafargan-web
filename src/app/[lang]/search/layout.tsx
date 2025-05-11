import * as React from 'react';
import type { Metadata, ResolvingMetadata } from 'next';
import { cookies } from 'next/headers';
import { Inter } from 'next/font/google';
import Providers from '../Providers';
import { initTranslations } from '@i18n/index';
import { DictionaryLang, WebsiteLang } from '../../../api/types.model';
import TopBar from './components/TopBar';
import { Params, RootLayoutProps } from '../types';

// const languages = ['eng', 'rus', 'lez'];

// export async function generateStaticParams() {
//   return languages.map((lang) => ({ lang }));
// }

// export async function generateMetadata(
//   props: RootLayoutProps,
//   parent: ResolvingMetadata,
// ): Promise<Metadata> {
//   const { lang } = await props.params;
//   // eslint-disable-next-line react-hooks/rules-of-hooks
//   const { t } = await initTranslations(lang);
//   return {
//     title: t('meta.title'),
//     description: t('meta.description'),
//     // openGraph: {
//     //   images: ['/some-specific-page-image.jpg', ...previousImages],
//     // },
//   };
// }

export default async function RootLayout(props: RootLayoutProps) {
  const { children, params } = props;
  const cookieStore = await cookies();
  const { lang } = await params;
  const sessionId = cookieStore.get('sessionid');

  return (
    <Providers locale={lang}>
      <TopBar currentLang={lang as WebsiteLang} sessionId={sessionId?.value} />
      {children}
    </Providers>
  );
}
