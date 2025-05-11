'use client';
import * as React from 'react';
import { NextAppProvider } from '@toolpad/core/nextjs';
import { DashboardLayout, PageContainer, Navigation } from '@toolpad/core';
import { usePathname, useParams } from 'next/navigation';
import LinearProgress from '@mui/material/LinearProgress';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PersonIcon from '@mui/icons-material/Person';
import { WebsiteLang } from '@api/types.model';
import { useTranslation } from 'react-i18next';

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

const BRANDING = {
  title: 'Gafargan Dashboard',
};

export default function DashboardPagesLayout(props: { children: React.ReactNode }) {
  const { t } = useTranslation();
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
    <NextAppProvider navigation={NAVIGATION(lang)} branding={BRANDING}>
      <DashboardLayout>
        <PageContainer title={title}>{props.children}</PageContainer>
      </DashboardLayout>
    </NextAppProvider>
  );
}
