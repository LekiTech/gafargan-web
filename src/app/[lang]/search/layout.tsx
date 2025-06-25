import * as React from 'react';
import type { Metadata, ResolvingMetadata } from 'next';
import { cookies, headers } from 'next/headers';
import { Inter } from 'next/font/google';
import Providers from '../Providers';
import { initTranslations } from '@i18n/index';
import { DictionaryLang, WebsiteLang } from '../../../api/types.model';
import TopBar from './components/TopBar';
import { Params, RootLayoutProps } from '../types';
import { PromoSnackbar } from './components/PromoSnackbar';
import images from '@/store/images';
import { Button } from '@mui/material';

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
  const { t } = await initTranslations(lang);

  const userAgent = (await headers()).get('user-agent') || '';
  const isAndroid = /android.+mobile/i.test(userAgent);
  const isIOS = /iphone|ipad|ipod/i.test(userAgent);
  const isMobile = isAndroid || isIOS;
  const isDesktop = !isMobile;
  const message = t('tryGafarganOffline');
  const imageLang = lang === 'lez' ? 'rus' : lang;
  return (
    // <Providers locale={lang}>
    <>
      <TopBar currentLang={lang as WebsiteLang} sessionId={sessionId?.value} />
      {children}
      {/* TODO: add popup with link to App Store and Play Store */}
      <PromoSnackbar flexDirection={isDesktop ? 'row' : 'column'}>
        <span
          style={{
            marginRight: isDesktop ? '10px' : 'unset',
            marginBottom: isDesktop ? 'unset' : '10px',
          }}
        >
          {message}
        </span>
        {(isDesktop || isAndroid) && (
          <a
            target="_blank"
            href="https://play.google.com/store/apps/details?id=io.lekitech.gafargan"
          >
            <img
              width={130}
              height={40}
              src={images.stores.android[imageLang].src}
              style={{ marginRight: isDesktop ? '10px' : 'unset' }}
              alt="Play Store"
            />
          </a>
        )}
        {(isDesktop || isIOS) && (
          <a target="_blank" href="https://apps.apple.com/app/gafargan/id6736903871">
            <img width={120} height={40} src={images.stores.ios[imageLang].src} alt="App Store" />
          </a>
        )}
      </PromoSnackbar>
    </>
  );
}
