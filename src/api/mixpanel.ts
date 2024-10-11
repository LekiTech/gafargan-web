'use server';
import Mixpanel from 'mixpanel';
import { cookies } from 'next/headers';
import { randomUUID } from 'crypto';

const isDev = process.env.NODE_ENV === 'development';

const _mixpanel = isDev
  ? undefined
  : Mixpanel.init(process.env.MIXPANEL_TOKEN!, {
      host: 'api-eu.mixpanel.com',
      geolocate: true,
    });

// export async function createSessionCookie(newSessionId: string) {
//   const cookieStore = cookies();
//   cookieStore.set('sessionid', newSessionId, {
//     httpOnly: true,
//     secure: process.env.NODE_ENV === 'production',
//     path: '/',
//     sameSite: 'lax',
//   });
// }

class MixpanelClient {
  createUserProfile(properties: Record<string, string>) {
    if (isDev) {
      return;
    }
    const newSessionId = randomUUID();
    const cookieStore = cookies();
    cookieStore.set('sessionid', newSessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      sameSite: 'lax',
    });
    _mixpanel?.people.set(newSessionId, {
      $created: new Date().toISOString(),
      isDev: isDev,
      ...properties,
    });
  }

  trackWebsiteLanguageChange(lang: string) {
    const cookieStore = cookies();
    const sessionId = cookieStore.get('sessionid');
    if (isDev || !sessionId) {
      return;
    }
    _mixpanel?.track('Website Language Change', {
      distinct_id: sessionId,
      lang: lang,
    });
  }

  trackTranslationSearch(search: { searchQuery: string; fromLang: string; toLang: string }) {
    const cookieStore = cookies();
    const sessionId = cookieStore.get('sessionid');
    if (isDev || !sessionId) {
      return;
    }
    _mixpanel?.track('Translation Search', {
      distinct_id: sessionId,
      searchQuery: search.searchQuery,
      fromLang: search.fromLang,
      toLang: search.toLang,
    });
  }

  trackNumbersToLezgi() {
    const cookieStore = cookies();
    const sessionId = cookieStore.get('sessionid');
    if (isDev || !sessionId) {
      return;
    }
    _mixpanel?.track('Numbers to Lezgi', {
      distinct_id: sessionId,
    });
  }

  trackLezgiToNumbers() {
    const cookieStore = cookies();
    const sessionId = cookieStore.get('sessionid');
    if (isDev || !sessionId) {
      return;
    }
    _mixpanel?.track('Lezgi to Numbers', {
      distinct_id: sessionId,
    });
  }
}

const mixpanel = new MixpanelClient();

export const createUserProfile = mixpanel.createUserProfile;
export const trackWebsiteLanguageChange = mixpanel.trackWebsiteLanguageChange;
export const trackTranslationSearch = mixpanel.trackTranslationSearch;
export const trackNumbersToLezgi = mixpanel.trackNumbersToLezgi;
export const trackLezgiToNumbers = mixpanel.trackLezgiToNumbers;
