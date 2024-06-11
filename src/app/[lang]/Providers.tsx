'use client';
import React, { FC } from 'react';
import { Provider } from 'react-redux';
import { store } from './store';

import { I18nextProvider } from 'react-i18next';
import { initTranslations } from '..//i18n';
import { Resource, createInstance } from 'i18next';

type TranslationProviderProps = {
  children: React.ReactNode;
  locale: string;
};

const TranslationsProvider: FC<TranslationProviderProps> = ({ children, locale }) => {
  const i18n = createInstance();

  initTranslations(locale, i18n);

  return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>;
};

type ProviderProps = {
  children: React.ReactNode;
} & TranslationProviderProps;

//TODO: reenable after store is implemented
// const Providers: FC<ProviderProps> = ({ children }) => {
//   return <Provider store={store}>{children}</Provider>;
// };
const Providers: FC<ProviderProps> = ({ children, locale }) => {
  return (
    <Provider store={store}>
      <TranslationsProvider locale={locale}>{children}</TranslationsProvider>
    </Provider>
  )
};

export default Providers;
