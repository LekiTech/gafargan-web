import './globals.css';
import * as React from 'react';
import { Metadata, ResolvingMetadata } from 'next';
import { Inter } from 'next/font/google';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v15-appRouter';
import { dir } from 'i18next';
import { colors } from './colors';
import { Params, RootLayoutProps } from './types';
import { initTranslations } from '@i18n/index';
import { headers } from 'next/headers';
import Providers from './Providers';

const languages = ['eng', 'rus', 'lez'];

export async function generateStaticParams() {
  return languages.map((lang) => ({ lang }));
}

export async function generateMetadata(
  props: RootLayoutProps,
  parent: ResolvingMetadata,
): Promise<Metadata> {
  const params = await props.params;
  const { lang } = params;
  const { t } = await initTranslations(lang);

  const headersLst = await headers();
  const pathname = headersLst.get('x-next-pathname');

  const matchDashboardPath = /^\/\w{3}\/dashboard(\/|$)/;
  // console.log(pathname, matchDashboardPath.test(pathname!));
  if (pathname && matchDashboardPath.test(pathname)) {
    return {
      title: t('meta.title', { ns: 'dashboard' }),
      description: t('meta.description', { ns: 'dashboard' }),
    };
  }
  return {
    title: t('meta.title'),
    description: t('meta.description'),
    // openGraph: {
    //   images: ['/some-specific-page-image.jpg', ...previousImages],
    // },
  };
}

const inter = Inter({ subsets: ['latin'] });

export default async function RootLayout(props: RootLayoutProps) {
  const { children, params } = props;
  const { lang } = await params;

  return (
    <html
      lang={lang}
      dir={dir(lang)}
      style={{ scrollBehavior: 'smooth', scrollPaddingTop: '100px' }}
    >
      <body
        className={inter.className}
        style={{ backgroundColor: colors.background, margin: 0, overflowX: 'hidden' }}
      >
        <AppRouterCacheProvider options={{ enableCssLayer: true }}>
          <Providers locale={lang}>{children}</Providers>
        </AppRouterCacheProvider>
      </body>
    </html>
  );
}
