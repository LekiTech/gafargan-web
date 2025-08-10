import i18nConfig from './i18nConfig';

const namespaces = ['common', 'tags', 'dashboard'] as const;
const languages = i18nConfig.locales as readonly string[];

type Cache = Record<string, Record<string, any>>;
const cache: Cache = {};

async function loadOne(lng: string, ns: string) {
  const mod = await import(`./locales/${lng}/${ns}.json`);
  return (mod as any).default ?? mod; // Next/webpack put JSON on .default
}

// Preload everything once (at module load). You can also expose this and call it explicitly.
const ready: Promise<void> = (async () => {
  for (const lng of languages) {
    cache[lng] ??= {};
    for (const ns of namespaces) {
      cache[lng][ns] = await loadOne(lng, ns);
    }
  }
})();

export async function getResource(lng?: string, ns?: string) {
  await ready;
  const safeLng = languages.includes(lng!) ? lng! : i18nConfig.defaultLocale;
  const safeNs =
    ns && namespaces.includes(ns as any) ? (ns as (typeof namespaces)[number]) : namespaces[0];
  return cache[safeLng][safeNs];
}
