'use client';
import React, { FC, useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import LinearProgress from '@mui/material/LinearProgress';
import { I18nextProvider } from 'react-i18next';
import { initTranslations } from '../i18n'; // Adjust the path as necessary
import { createInstance, i18n as I18nInstance } from 'i18next';
import { Provider } from 'react-redux';
// import store from '@/store';

type TranslationProviderProps = {
  children: React.ReactNode;
  locale: string;
};

const TranslationsProvider: FC<TranslationProviderProps> = ({ children, locale }) => {
  const [i18n, setI18n] = useState<I18nInstance | null>(null);

  useEffect(() => {
    const initializeI18n = async () => {
      const instance = createInstance();
      await initTranslations(locale, instance);
      setI18n(instance);
    };

    initializeI18n();
  }, [locale]);

  if (!i18n) {
    // return <div>Loading...</div>; // Show a loading state until i18n is initialized
    return (
      <Box sx={{ width: '100%' }}>
        <LinearProgress />
      </Box>
    );
  }

  return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>;
};

type ProviderProps = {
  children: React.ReactNode;
} & TranslationProviderProps;

const Providers: FC<ProviderProps> = ({ children, locale }) => {
  return (
    // <Provider store={store}>
    <TranslationsProvider locale={locale}>{children}</TranslationsProvider>
    // </Provider>
  );
};

export default Providers;
