import { InitOptions } from 'i18next';

export const fallbackLng = 'eng';
export const languages = [fallbackLng, 'rus', 'lez', 'tur'];
export const defaultNS = 'common';
export const cookieName = 'i18next';

export function getOptions<T>(lng = fallbackLng, ns = defaultNS): InitOptions<T> {
  return {
    debug: true,
    supportedLngs: languages,
    fallbackLng,
    lng,
    fallbackNS: defaultNS,
    defaultNS,
    ns,
    interpolation: {
      escapeValue: false,
    },
    react: { useSuspense: false },
  };
}
