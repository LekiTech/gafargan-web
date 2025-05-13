'use client';
import * as React from 'react';
import { NextAppProvider } from '@toolpad/core/nextjs';
import { DashboardLayout, PageContainer, Navigation, Branding } from '@toolpad/core';
import { usePathname, useParams } from 'next/navigation';
import LinearProgress from '@mui/material/LinearProgress';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PersonIcon from '@mui/icons-material/Person';
import { WebsiteLang } from '@api/types.model';
import { useTranslation } from 'react-i18next';
import images from '@/store/images';
import { useTheme } from '@mui/material';

const NAVIGATION = (lang: WebsiteLang): Navigation => [
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
    segment: `${lang}/employees`,
    title: 'Employees',
    icon: <PersonIcon />,
    pattern: 'employees{/:employeeId}*',
  },
];

const BRANDING = (lang: WebsiteLang): Branding => ({
  title: 'Gafargan Dashboard',
  logo: <img src={images.logo.src} />,
  homeUrl: `${lang}/dashboard`,
});

export default function DashboardPagesLayout(props: { children: React.ReactNode }) {
  const { t } = useTranslation();
  const theme = useTheme();
  const pathname = usePathname();
  const { lang } = useParams() as { lang: WebsiteLang };
  // const [employeeId] = params.segments ?? [];

  const title = React.useMemo(() => {
    if (pathname === '/employees/new') {
      return 'New Employee';
    }
    // if (employeeId && pathname.includes('/edit')) {
    //   return `Employee ${employeeId} - Edit`;
    // }
    // if (employeeId) {
    //   return `Employee ${employeeId}`;
    // }
    return undefined;
  }, [pathname]);
  // }, [employeeId, pathname]);

  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <LinearProgress />;
  }

  return (
    <NextAppProvider navigation={NAVIGATION(lang)} branding={BRANDING(lang)} theme={theme}>
      <DashboardLayout>
        <PageContainer title={title}>{props.children}</PageContainer>
      </DashboardLayout>
    </NextAppProvider>
  );
}
