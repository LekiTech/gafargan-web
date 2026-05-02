'use server';

import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import { authenticateDashboardUser, createDashboardSession } from '../auth';
import { checkLoginRateLimit, clearFailedLogins, recordFailedLogin } from './rateLimit';

const getSafeRedirectPath = (value: FormDataEntryValue | null, lang: string) => {
  if (typeof value !== 'string' || !value.startsWith('/') || value.startsWith('//')) {
    return `/${lang}/dashboard`;
  }

  if (!value.startsWith(`/${lang}/dashboard`) || value.includes('/dashboard/login')) {
    return `/${lang}/dashboard`;
  }

  return value;
};

export async function loginDashboardUser(formData: FormData): Promise<void> {
  const email = formData.get('email');
  const password = formData.get('password');
  const lang = typeof formData.get('lang') === 'string' ? String(formData.get('lang')) : 'eng';
  const redirectTo = getSafeRedirectPath(formData.get('redirectTo'), lang);
  const headersList = await headers();
  const ip =
    headersList.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    headersList.get('x-real-ip') ??
    'unknown';

  if (typeof email !== 'string' || typeof password !== 'string' || !email || !password) {
    redirect(`/${lang}/dashboard/login?error=missing&redirectTo=${encodeURIComponent(redirectTo)}`);
  }

  const rateLimit = await checkLoginRateLimit(email, ip);
  if (!rateLimit.allowed) {
    redirect(
      `/${lang}/dashboard/login?error=rate-limited&retryAfter=${rateLimit.retryAfterSeconds}&redirectTo=${encodeURIComponent(redirectTo)}`,
    );
  }

  let user = null;
  try {
    user = await authenticateDashboardUser(email, password);
  } catch (error) {
    console.error('Dashboard login failed:', error);
    redirect(`/${lang}/dashboard/login?error=server&redirectTo=${encodeURIComponent(redirectTo)}`);
  }

  if (!user) {
    const failedLogin = await recordFailedLogin(email, ip);
    if (!failedLogin.allowed) {
      redirect(
        `/${lang}/dashboard/login?error=rate-limited&retryAfter=${failedLogin.retryAfterSeconds}&redirectTo=${encodeURIComponent(redirectTo)}`,
      );
    }
    redirect(`/${lang}/dashboard/login?error=invalid&redirectTo=${encodeURIComponent(redirectTo)}`);
  }

  await clearFailedLogins(email, ip);
  await createDashboardSession(user);
  redirect(redirectTo);
}
