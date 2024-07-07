import { Resource, createInstance, i18n } from 'i18next';
import resourcesToBackend from 'i18next-resources-to-backend';
import { initReactI18next } from 'react-i18next/initReactI18next';
import { getOptions } from './settings';

// const initI18next = async (lng: string, ns: string) => {
//   const i18nInstance = createInstance();
//   await i18nInstance
//     .use(initReactI18next)
//     .use(
//       resourcesToBackend(
//         (language: string, namespace: string) => import(`./locales/${language}/${namespace}.json`),
//       ),
//     )
//     .init(getOptions(lng, ns));
//   return i18nInstance;
// };

// export async function useTranslation(lng: string, ns: string = 'common', options: any = {}) {
//   const i18nextInstance = await initI18next(lng, ns);
//   return {
//     t: i18nextInstance.getFixedT(lng, Array.isArray(ns) ? ns[0] : ns, options.keyPrefix),
//     i18n: i18nextInstance,
//   };
// }

// export async function getTranslation(lng: string, ns: string = 'common', options: any = {}) {
//   const i18nextInstance = await initI18next(lng, ns);
//   return {
//     t: i18nextInstance.getFixedT(lng, Array.isArray(ns) ? ns[0] : ns, options.keyPrefix),
//     i18n: i18nextInstance,
//   };
// }

import i18nConfig from './i18nConfig';

const namespaces = ['common', 'tags']; // Ensure this is only namespaces and not altered
const languages = i18nConfig.locales;

export async function initTranslations(locale: string, i18nInstance?: i18n) {
  i18nInstance = i18nInstance || createInstance();

  i18nInstance.use(initReactI18next);

  i18nInstance.use(
    resourcesToBackend(
      (language: string = i18nConfig.defaultLocale, namespace: string = namespaces[0]) => {
        console.log('RESOURCE_TO_BACKEND:  language', language, 'namespace', namespace);
        if (!languages.includes(language)) {
          return import(`./locales/${i18nConfig.defaultLocale}/${namespace}.json`);
        }
        if (!namespaces.includes(namespace)) {
          return import(`./locales/${language}/${namespaces[0]}.json`);
        }
        if (!languages.includes(language) && !namespaces.includes(namespace)) {
          return import(`./locales/${i18nConfig.defaultLocale}/${namespaces[0]}.json`);
        }
        return import(`./locales/${language}/${namespace}.json`);
      },
    ),
  );

  await i18nInstance.init({
    lng: locale,
    fallbackLng: i18nConfig.defaultLocale,
    supportedLngs: i18nConfig.locales,
    defaultNS: namespaces[0],
    fallbackNS: namespaces[0],
    ns: [...namespaces],
    debug: true,
  });

  console.log('namespaces', namespaces, locale);

  return {
    i18n: i18nInstance,
    resources: i18nInstance.services.resourceStore.data,
    t: i18nInstance.t,
  };
}
