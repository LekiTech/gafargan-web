import { headers } from 'next/headers';
import type { ReactNode } from 'react';
import DashboardShell from './DashboardShell';
import { requireDashboardUser } from './auth';

export const dynamic = 'force-dynamic';

export default async function DashboardPagesLayout(props: {
  children: ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await props.params;
  const headersList = await headers();
  const pathname = headersList.get('x-next-pathname') ?? `/${lang}/dashboard`;
  const isAuthRoute = /^\/\w{3}\/dashboard\/(login|logout)(\/|$)/.test(pathname);

  if (isAuthRoute) {
    return <>{props.children}</>;
  }

  const user = await requireDashboardUser(lang, pathname);

  return <DashboardShell user={user}>{props.children}</DashboardShell>;
}
