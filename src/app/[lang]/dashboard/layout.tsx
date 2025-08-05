'use client';
import * as React from 'react';
import { NextAppProvider } from '@toolpad/core/nextjs';
import {
  DashboardLayout,
  DashboardSidebarPageItem,
  PageContainer,
  Navigation,
  Branding,
  Account,
  NavigationPageItem,
  useNavigation,
} from '@toolpad/core';
import { usePathname, useParams, useRouter } from 'next/navigation';
import LinearProgress from '@mui/material/LinearProgress';
import DashboardIcon from '@mui/icons-material/Dashboard';
import LocalLibraryIcon from '@mui/icons-material/LocalLibrary';
import SpellcheckIcon from '@mui/icons-material/Spellcheck';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import TextIncreaseIcon from '@mui/icons-material/TextIncrease';
import TranslateIcon from '@mui/icons-material/Translate';
import PersonIcon from '@mui/icons-material/Person';
import { WebsiteLang } from '@api/types.model';
import { useTranslation } from 'react-i18next';
import images from '@/store/images';
import {
  Button,
  Collapse,
  Link,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Stack,
  Typography,
  useTheme,
} from '@mui/material';
import { Routes } from '../../routes';
import { FC } from 'react';
import { CustomNavigationListItemButton } from './components/CustomNavigationListItemButton';

const NAVIGATION = (lang: WebsiteLang): Navigation => {
  return [
    {
      kind: 'header',
      title: 'Main items',
    },
    {
      segment: `${lang}/dashboard`,
      title: 'Dashboard',
      icon: <DashboardIcon />,
    },
    {
      segment: `${lang}/dashboard/sources`,
      title: 'Sources',
      icon: <LocalLibraryIcon />,
    },
    {
      segment: `${lang}/${Routes.Dictionary}`,
      title: 'Dictionary',
      icon: <MenuBookIcon />,
      // title: 'Review',
      // icon: <SpellcheckIcon />,
      // children: [
      //   {
      //     segment: 'lord-of-the-rings',
      //     title: 'Lord of the Rings',
      //     icon: <SpellcheckIcon />,
      //   },
      //   {
      //     segment: 'harry-potter',
      //     title: 'Harry Potter',
      //     icon: <SpellcheckIcon />,
      //   },
      // ],
    },
    // {
    //   segment: `${lang}/dashboard/add-word`,
    //   title: 'Add Words',
    //   icon: <TextIncreaseIcon />,
    //   // pattern: 'employees{/:employeeId}*',
    // },
    {
      segment: `${lang}/dashboard/translations`,
      title: 'Translations',
      icon: <TranslateIcon />,
    },
  ];
};

const BRANDING = (lang: WebsiteLang): Branding => ({
  title: 'Gafargan Dashboard',
  logo: <img src={images.logo.src} />,
  homeUrl: `/${lang}/dashboard`,
});

const CustomThemeSwitcher: FC<{ websiteLang: WebsiteLang }> = ({ websiteLang }) => {
  const router = useRouter();
  const handleAccountClick = () => {
    router.push(`/${websiteLang}/${Routes.AddWord}`);
  };
  return (
    <React.Fragment>
      {/* <Button
        type="button"
        variant="contained"
        aria-label="settings"
        startIcon={<TextIncreaseIcon />}
        onClick={handleAccountClick}
      >
        Add Words
      </Button> */}
    </React.Fragment>
  );
};

function CustomToolbarActions() {
  const pathname = usePathname();
  const { lang } = useParams() as { lang: WebsiteLang };
  return (
    <Stack direction="row" alignItems="center">
      {pathname === `/${lang}/${Routes.Dictionary}` && <CustomThemeSwitcher websiteLang={lang} />}
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
  // const [employeeId] = params.segments ?? [];

  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const renderPageItem = React.useCallback(
    (item: NavigationPageItem, { mini }: { mini: boolean }) => {
      const addWordUrlPath = `/${lang}/${Routes.AddWord}`;
      const reviewSegment = `${lang}/${Routes.Dictionary}`;
      if (pathname === addWordUrlPath) {
        return (
          // NOTE: This is a workaround to prevent the default behavior of the link
          //       Better to rewrite it once MUI supports overriding onClick handlers for DashboardSidebarPageItem
          <DashboardSidebarPageItem
            item={item}
            LinkComponent={() => (
              <CustomNavigationListItemButton
                onClick={() => {
                  const confirmed = confirm('Are you sure? All unsaved changes will be lost.');
                  if (confirmed && item.segment) {
                    router.push(`/${item.segment}`);
                  }
                }}
                selected={
                  pathname === addWordUrlPath
                    ? item.segment === reviewSegment
                    : pathname === `/${item.segment}`
                }
                sx={{
                  flexDirection: mini ? 'column' : 'row',
                  justifyContent: mini ? 'center' : 'flex-start',
                  alignItems: 'center',
                  height: mini ? '60px' : 'auto',
                }}
              >
                <ListItemIcon
                  sx={{ minWidth: 'fit-content', pr: mini ? undefined : '10px !important' }}
                >
                  {item.icon}
                </ListItemIcon>
                {mini ? (
                  <Typography
                    component="span"
                    variant="caption"
                    sx={{
                      // transform: 'translateX(-50%)',
                      fontSize: '10px',
                      fontWeight: '500',
                      textAlign: 'center',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      maxWidth: '56px',
                    }}
                  >
                    {item.title}
                  </Typography>
                ) : (
                  <ListItemText sx={{ ml: '5px' }} primary={item.title} />
                )}
              </CustomNavigationListItemButton>
            )}
          />
        );
      }
      return <DashboardSidebarPageItem item={item} />;
    },
    [lang, pathname, router],
  );

  if (!mounted) {
    return <LinearProgress />;
  }

  return (
    <NextAppProvider navigation={NAVIGATION(lang)} branding={BRANDING(lang)} theme={theme}>
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
