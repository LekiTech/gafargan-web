'use client';

import * as React from 'react';
import { NextAppProvider } from '@toolpad/core/nextjs';
import {
  DashboardLayout,
  DashboardSidebarPageItem,
  PageContainer,
  Navigation,
  Branding,
  NavigationPageItem,
} from '@toolpad/core';
import { useParams, useRouter } from 'next/navigation';
import LinearProgress from '@mui/material/LinearProgress';
import DashboardIcon from '@mui/icons-material/Dashboard';
import LocalLibraryIcon from '@mui/icons-material/LocalLibrary';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import TranslateIcon from '@mui/icons-material/Translate';
import LogoutIcon from '@mui/icons-material/Logout';
import PeopleIcon from '@mui/icons-material/People';
import { WebsiteLang } from '@api/types.model';
import { useTranslation } from 'react-i18next';
import images from '@/store/images';
import { Button, Stack, Typography, useTheme } from '@mui/material';
import { Routes } from '../../routes';
import { FC } from 'react';
import { TFunction } from 'i18next';
import WebLanguageSelect from '@/components/WebLanguageSelect';
import { colors } from '@/colors';
import type { DashboardSessionUser } from './auth';
import { Role } from '@repository/entities/enums';

const NAVIGATION = (lang: WebsiteLang, t: TFunction, user: DashboardSessionUser): Navigation => {
  const navigation: Navigation = [
    {
      kind: 'header',
      title: t('menu.mainItems', { ns: 'dashboard' }),
    },
    {
      segment: `${lang}/${Routes.Dashboard}`,
      title: t('menu.dashboard', { ns: 'dashboard' }),
      icon: <DashboardIcon />,
    },
    {
      segment: `${lang}/${Routes.Dictionary}`,
      title: t('menu.dictionary', { ns: 'dashboard' }),
      icon: <MenuBookIcon />,
    },
    {
      segment: `${lang}/${Routes.Translations}`,
      title: t('menu.translations', { ns: 'dashboard' }),
      icon: <TranslateIcon />,
    },
    {
      segment: `${lang}/${Routes.Sources}`,
      title: t('menu.sources', { ns: 'dashboard' }),
      icon: <LocalLibraryIcon />,
    },
  ];

  if (user.role === Role.Admin) {
    navigation.push({
      segment: `${lang}/${Routes.Users}`,
      title: 'Users',
      icon: <PeopleIcon />,
    });
  }

  return navigation;
};

const BRANDING = (lang: WebsiteLang, t: TFunction): Branding => ({
  title: t('gafarganDashboard', { ns: 'dashboard' }),
  logo: <img src={images.logo.src} alt="" />,
  homeUrl: `/${lang}/dashboard`,
});

const CustomThemeSwitcher: FC<{ websiteLang: WebsiteLang }> = ({ websiteLang }) => {
  return (
    <WebLanguageSelect
      currentLang={websiteLang}
      flagHeight={20}
      flagWidth={30}
      fontSize={18}
      fontColor={colors.text.dark}
    />
  );
};

function CustomToolbarActions({ user }: { user: DashboardSessionUser }) {
  const { lang } = useParams() as { lang: WebsiteLang };
  const router = useRouter();

  const handleLogout = async () => {
    await fetch(`/${lang}/dashboard/logout`, { method: 'POST' });
    router.push(`/${lang}/dashboard/login`);
    router.refresh();
  };

  return (
    <Stack direction="row" alignItems="center" gap={1.5}>
      <Typography variant="body2" color="text.secondary" sx={{ display: { xs: 'none', sm: 'block' } }}>
        {user.name ?? user.email}
      </Typography>
      <CustomThemeSwitcher websiteLang={lang} />
      <Button
        type="button"
        size="small"
        color="inherit"
        startIcon={<LogoutIcon fontSize="small" />}
        onClick={handleLogout}
      >
        Logout
      </Button>
    </Stack>
  );
}

export default function DashboardShell(props: {
  children: React.ReactNode;
  user: DashboardSessionUser;
}) {
  const { t } = useTranslation();
  const theme = useTheme();
  const { lang } = useParams() as { lang: WebsiteLang };
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const renderPageItem = React.useCallback(
    (item: NavigationPageItem, { mini }: { mini: boolean }) => {
      return <DashboardSidebarPageItem item={item} />;
    },
    [],
  );

  if (!mounted) {
    return <LinearProgress />;
  }

  return (
    <NextAppProvider
      navigation={NAVIGATION(lang, t, props.user)}
      branding={BRANDING(lang, t)}
      theme={theme}
    >
      <DashboardLayout
        slots={{
          toolbarActions: () => <CustomToolbarActions user={props.user} />,
        }}
        renderPageItem={renderPageItem}
      >
        <PageContainer>{props.children}</PageContainer>
      </DashboardLayout>
    </NextAppProvider>
  );
}
