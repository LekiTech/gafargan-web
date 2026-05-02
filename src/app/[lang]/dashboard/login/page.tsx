import { redirect } from 'next/navigation';
import LoginForm from './LoginForm';
import { getDashboardSessionUser } from '../auth';

export default async function DashboardLoginPage({
  params,
  searchParams,
}: {
  params: Promise<{ lang: string }>;
  searchParams: Promise<{ redirectTo?: string; error?: string; retryAfter?: string }>;
}) {
  const { lang } = await params;
  const { redirectTo, error, retryAfter } = await searchParams;
  const user = await getDashboardSessionUser();

  if (user) {
    redirect(redirectTo && redirectTo.startsWith(`/${lang}/dashboard`) ? redirectTo : `/${lang}/dashboard`);
  }

  return <LoginForm lang={lang} redirectTo={redirectTo} error={error} retryAfter={retryAfter} />;
}
