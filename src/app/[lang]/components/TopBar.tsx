'use client';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import { Typography } from '@mui/material';
import { useTranslation } from '../../i18n';
import Search from './Search';
import * as React from 'react';
import useScrollTrigger from '@mui/material/useScrollTrigger';
import { Lang } from '../api/types';

type Props = {
  /**
   * Injected by the documentation to work in an iframe.
   * You won't need it on your project.
   */
  window?: () => Window;
  children: React.ReactElement;
};

function ElevationScroll(props: Props) {
  const { children, window } = props;
  // Note that you normally won't need to set the window ref as useScrollTrigger
  // will default to window.
  // This is only being set here because the demo is in an iframe.
  const trigger = useScrollTrigger({
    disableHysteresis: true,
    threshold: 0,
    target: window ? window() : undefined,
  });

  return React.cloneElement(children, {
    elevation: trigger ? 4 : 0,
  });
}

type TopBarProps = {
  children: React.ReactNode;
  params: { lang: string };
  searchParams: { fromLang: string; toLang: string };
};

export const TopBar = async (props: TopBarProps) => {
  const {
    children,
    params: { lang },
    searchParams,
  } = props;
  const { t } = await useTranslation(lang);
  const selectedLanguages = {
    from: (searchParams?.fromLang ?? 'lez') as Lang,
    to: (searchParams?.toLang ?? 'rus') as Lang,
  };
  return (
    <ElevationScroll {...props}>
      <AppBar sx={{ backgroundColor: 'white', color: '#333' }}>
        <Toolbar>
          <Typography variant="h6" component="div">
            Гафарган
          </Typography>
          <Search
            fromLang={{
              name: t(`languages.${selectedLanguages.from}`),
              code: selectedLanguages.from,
            }}
            toLang={{
              name: t(`languages.${selectedLanguages.to}`),
              code: selectedLanguages.to,
            }}
          />
        </Toolbar>
      </AppBar>
    </ElevationScroll>
  );
};
