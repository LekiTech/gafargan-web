import { IdToLang, LangToId } from '@api/languages';
import { TFunction } from 'i18next';

export function langDialectIdToString(
  langDialectId: number,
  t: TFunction,
  options?: { showOnlyLang: boolean } | { showOnlyDialect: boolean },
): string {
  if (!langDialectId) {
    return '';
  }
  const wordLangIsoCode = IdToLang[langDialectId];
  const langName = t(`languages.${wordLangIsoCode}.name`, { ns: 'dashboard' });
  if (options && 'showOnlyLang' in options && options.showOnlyLang) {
    return langName;
  }
  const dialectName =
    LangToId[wordLangIsoCode]?.length > 1
      ? ` ${t(`languages.${wordLangIsoCode}.dialects.${langDialectId}`, { ns: 'dashboard' })}`
      : '';
  if (options && 'showOnlyDialect' in options && options.showOnlyDialect) {
    return dialectName;
  }
  return langName + ' ' + dialectName;
}
