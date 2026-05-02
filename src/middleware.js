// import { NextResponse } from 'next/server'
// import acceptLanguage from 'accept-language'
// import { fallbackLng, languages, cookieName } from './app/i18n/settings'

// acceptLanguage.languages(languages)

// export const config = {
//   // matcher: '/:lng*'
//   matcher: ['/((?!api|_next/static|_next/image|assets|favicon.ico|sw.js).*)']
// }

// export function middleware(req) {
//   let lng
//   if (req.cookies.has(cookieName)) lng = acceptLanguage.get(req.cookies.get(cookieName).value)
//   if (!lng) lng = acceptLanguage.get(req.headers.get('Accept-Language'))
//   if (!lng) lng = fallbackLng

//   // Redirect if lng in path is not supported
//   if (
//     !languages.some(loc => req.nextUrl.pathname.startsWith(`/${loc}`)) &&
//     !req.nextUrl.pathname.startsWith('/_next')
//   ) {
//     return NextResponse.redirect(new URL(`/${lng}${req.nextUrl.pathname}`, req.url))
//   }

//   if (req.headers.has('referer')) {
//     const refererUrl = new URL(req.headers.get('referer'))
//     const lngInReferer = languages.find((l) => refererUrl.pathname.startsWith(`/${l}`))
//     const response = NextResponse.next()
//     if (lngInReferer) response.cookies.set(cookieName, lngInReferer)
//     return response
//   }

//   return NextResponse.next()
// }
import { i18nRouter } from 'next-i18n-router';
import { NextResponse } from 'next/server';
import i18nConfig from './app/i18n/i18nConfig';

const SESSION_COOKIE = 'gafargan_dashboard_session';
const DASHBOARD_ROLES = new Set(['Admin', 'Moderator']);

const getAuthSecret = () =>
  process.env.DASHBOARD_AUTH_SECRET;

const decodeBase64Url = (value) => {
  const padded = value.replace(/-/g, '+').replace(/_/g, '/').padEnd(Math.ceil(value.length / 4) * 4, '=');
  return atob(padded);
};

const sign = async (value) => {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(getAuthSecret()),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const signature = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(value));

  return btoa(String.fromCharCode(...new Uint8Array(signature)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '');
};

const getDashboardSessionPayload = async (sessionValue) => {
  if (!sessionValue) {
    return null;
  }

  const [encodedPayload, signature] = sessionValue.split('.');

  if (!getAuthSecret() || !encodedPayload || !signature || signature !== (await sign(encodedPayload))) {
    return null;
  }

  try {
    const payload = JSON.parse(decodeBase64Url(encodedPayload));

    if (
      payload?.exp >= Math.floor(Date.now() / 1000) &&
      typeof payload?.role === 'string' &&
      DASHBOARD_ROLES.has(payload.role)
    ) {
      return payload;
    }

    return null;
  } catch {
    return null;
  }
};

export async function middleware(request) {
  request.headers.set('x-next-pathname', request.nextUrl.pathname);

  const dashboardMatch = request.nextUrl.pathname.match(/^\/(\w{3})\/dashboard(\/|$)/);

  if (dashboardMatch && !/^\/\w{3}\/dashboard\/(login|logout)(\/|$)/.test(request.nextUrl.pathname)) {
    const session = await getDashboardSessionPayload(request.cookies.get(SESSION_COOKIE)?.value);

    if (!session) {
      if (request.nextUrl.pathname.includes('/api')) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
      }

      const loginUrl = new URL(`/${dashboardMatch[1]}/dashboard/login`, request.url);
      loginUrl.searchParams.set('redirectTo', request.nextUrl.pathname + request.nextUrl.search);

      return NextResponse.redirect(loginUrl);
    }

    if (
      /^\/\w{3}\/dashboard\/users(\/|$)/.test(request.nextUrl.pathname) &&
      session.role !== 'Admin'
    ) {
      if (request.nextUrl.pathname.includes('/api')) {
        return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
      }

      return NextResponse.redirect(new URL(`/${dashboardMatch[1]}/dashboard`, request.url));
    }
  }

  return i18nRouter(request, i18nConfig);
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|assets|favicon.ico|sw.js).*)'],
};
