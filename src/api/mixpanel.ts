'use server';
import Mixpanel from 'mixpanel';
import { cookies } from 'next/headers';
import { headers } from 'next/headers';
import { randomUUID } from 'crypto';

const isDev = process.env.NODE_ENV === 'development';

const _mixpanel = isDev
  ? undefined
  : Mixpanel.init(process.env.MIXPANEL_TOKEN!, {
      host: 'api-eu.mixpanel.com',
      geolocate: false,
    });

function IP() {
  const FALLBACK_IP_ADDRESS = '0.0.0.0';
  const forwardedFor = headers().get('x-forwarded-for');
  console.log('forwardedFor', forwardedFor);
  if (forwardedFor) {
    return forwardedFor.split(',')[0] ?? FALLBACK_IP_ADDRESS;
  }
  return headers().get('x-real-ip') ?? FALLBACK_IP_ADDRESS;
}

class MixpanelClient {
  createUserProfile(properties: Record<string, string>) {
    if (isDev) {
      return;
    }
    const newSessionId = randomUUID();
    const cookieStore = cookies();
    cookieStore.set('sessionid', newSessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV !== 'development',
      path: '/',
      sameSite: 'lax',
    });
    const ip = IP();
    console.log('createUserProfile ip', ip);
    _mixpanel?.people.set(newSessionId, {
      $created: new Date().toISOString(),
      ip,
      ...properties,
    });
  }

  trackWebsiteLanguageChange(lang: string) {
    const cookieStore = cookies();
    const sessionId = cookieStore.get('sessionid');
    if (isDev || !sessionId) {
      return;
    }
    const ip = IP();
    console.log('trackWebsiteLanguageChange ip', ip);
    _mixpanel?.track('Website Language Change', {
      distinct_id: sessionId.value,
      ip,
      lang: lang,
    });
  }

  trackTranslationSearch(search: {
    searchQuery: string;
    fromLang: string;
    toLang: string;
    searchType: 'enter_key' | 'search_button' | 'option_select';
  }) {
    const cookieStore = cookies();
    const sessionId = cookieStore.get('sessionid');
    if (isDev || !sessionId) {
      return;
    }
    const ip = IP();
    console.log('trackTranslationSearch ip', ip);
    _mixpanel?.track('Translation Search', {
      distinct_id: sessionId.value,
      ip,
      searchQuery: search.searchQuery,
      fromLang: search.fromLang,
      toLang: search.toLang,
      searchType: search.searchType,
    });
  }

  trackNumbersToLezgi() {
    const cookieStore = cookies();
    const sessionId = cookieStore.get('sessionid');
    if (isDev || !sessionId) {
      return;
    }
    const ip = IP();
    console.log('trackNumbersToLezgi ip', ip);
    _mixpanel?.track('Numbers to Lezgi', {
      distinct_id: sessionId.value,
      ip,
    });
  }

  trackLezgiToNumbers() {
    const cookieStore = cookies();
    const sessionId = cookieStore.get('sessionid');
    if (isDev || !sessionId) {
      return;
    }
    const ip = IP();
    console.log('trackLezgiToNumbers ip', ip);
    _mixpanel?.track('Lezgi to Numbers', {
      distinct_id: sessionId.value,
      ip,
    });
  }

  trackWordOfTheDay(wordOfTheDay: string) {
    const cookieStore = cookies();
    const sessionId = cookieStore.get('sessionid');
    if (isDev || !sessionId) {
      return;
    }
    const ip = IP();
    console.log('trackWordOfTheDay ip', ip);
    _mixpanel?.track('Word of the Day', {
      distinct_id: sessionId.value,
      ip,
      wordOfTheDay: wordOfTheDay,
    });
  }
}

const mixpanel = new MixpanelClient();

export const createUserProfile = mixpanel.createUserProfile;
export const trackWebsiteLanguageChange = mixpanel.trackWebsiteLanguageChange;
export const trackTranslationSearch = mixpanel.trackTranslationSearch;
export const trackNumbersToLezgi = mixpanel.trackNumbersToLezgi;
export const trackLezgiToNumbers = mixpanel.trackLezgiToNumbers;
export const trackWordOfTheDay = mixpanel.trackWordOfTheDay;
