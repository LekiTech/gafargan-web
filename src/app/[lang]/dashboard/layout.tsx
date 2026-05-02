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
import { usePathname, useParams, useRouter } from 'next/navigation';
import LinearProgress from '@mui/material/LinearProgress';
import DashboardIcon from '@mui/icons-material/Dashboard';
import LocalLibraryIcon from '@mui/icons-material/LocalLibrary';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import TranslateIcon from '@mui/icons-material/Translate';
import { WebsiteLang } from '@api/types.model';
import { useTranslation } from 'react-i18next';
import images from '@/store/images';
import {
  ListItemIcon,
  ListItemText,
  Stack,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { Routes } from '../../routes';
import { FC } from 'react';
import { CustomNavigationListItemButton } from './components/CustomNavigationListItemButton';
import { TFunction } from 'i18next';
import WebLanguageSelect from '@/components/WebLanguageSelect';
import { colors } from '@/colors';

const NAVIGATION = (lang: WebsiteLang, t: TFunction): Navigation => {
  return [
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
};

const BRANDING = (lang: WebsiteLang, t: TFunction): Branding => ({
  title: t('gafarganDashboard', { ns: 'dashboard' }),
  logo: <img src={images.logo.src} />,
  homeUrl: `/${lang}/dashboard`,
});

const CustomThemeSwitcher: FC<{ websiteLang: WebsiteLang }> = ({ websiteLang }) => {
  return (
    <React.Fragment>
      <WebLanguageSelect
        currentLang={websiteLang}
        flagHeight={20}
        flagWidth={30}
        fontSize={18}
        fontColor={colors.text.dark}
      />
    </React.Fragment>
  );
};

function CustomToolbarActions() {
  const pathname = usePathname();
  const { lang } = useParams() as { lang: WebsiteLang };
  return (
    <Stack direction="row" alignItems="center">
      <CustomThemeSwitcher websiteLang={lang} />
      {/* <Account /> */}
    </Stack>
  );
}

export default function DashboardPagesLayout(props: { children: React.ReactNode }) {
  const { t } = useTranslation();
  const theme = useTheme();
  const pathname = usePathname();
  const router = useRouter();
  const { lang } = useParams() as { lang: WebsiteLang };
  const cancelMessage = t('addNewWord.messages.cancelMessage', { ns: 'dashboard' });
  // const [employeeId] = params.segments ?? [];

  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const renderPageItem = React.useCallback(
    (item: NavigationPageItem, { mini }: { mini: boolean }) => {
      return <DashboardSidebarPageItem item={item} />;
    },
    [lang, pathname, router],
  );

  if (!mounted) {
    return <LinearProgress />;
  }

  return (
    <NextAppProvider navigation={NAVIGATION(lang, t)} branding={BRANDING(lang, t)} theme={theme}>
      <DashboardLayout
        slots={{
          toolbarActions: CustomToolbarActions,
        }}
        renderPageItem={renderPageItem}
      >
        <PageContainer>{props.children}</PageContainer>
      </DashboardLayout>
    </NextAppProvider>
  );
}
