import { ExpressionDetails } from '../../../../api/types.model';
import { Contents } from './types';
import { cleanText } from '../../../utils/cleanText';
import { WordDetail } from '@repository/entities/WordDetail';
import { LangDialect } from '@repository/entities/LangDialect';
import { TFunction } from 'i18next';
import { IdToLang } from '@api/languages';

export function createSpellingId(
  idx: number,
  spelling: string,
  definitionDetailsLength: number,
  inflection?: string | null,
) {
  const spellingId =
    `${idx}-spelling-${spelling}-${inflection}-${definitionDetailsLength}`.replaceAll(' ', '_');
  return cleanText(spellingId);
}

export function createDetailsId(
  idx: number,
  spelling: string,
  definitionsCount: number,
  spellingId: string,
  inflection?: string | null,
  examplesCount?: number,
) {
  const detailsId = `${idx}-details-${spelling}-${inflection}-${definitionsCount}-${
    examplesCount ?? 0
  }`.replaceAll(' ', '_');
  return `${spellingId}-${cleanText(detailsId)}`;
}

export function createOtherExamplesId(idx: number) {
  return `${idx}-other-examples`;
}

export function toContents(idx: number, spelling: string, expressionDetails: WordDetail): Contents {
  const otherExamplesCount = expressionDetails.examples?.length ?? 0;
  const spellingId = createSpellingId(
    idx,
    spelling,
    expressionDetails.definitions.length,
    expressionDetails.inflection,
  );
  return {
    spellingId,
    spelling,
    inflection: expressionDetails.inflection,
    details: expressionDetails.definitions
      .map((dd, i) => {
        const definitionPreview = (dd.values[0]?.value ?? dd.examples?.[0]?.raw ?? '').replaceAll(
          /({|}|<|>)/g,
          '',
        );
        return {
          detailsId: createDetailsId(
            i,
            spelling,
            dd.values.length,
            spellingId,
            expressionDetails.inflection,
            dd.examples?.length,
          ),
          // `details-${spelling}-${expressionDetails.inflection}-` +
          // `${dd.definitions.length}-${dd.examples?.length ?? 0}-${Math.random()}`,
          definitionsCount: dd.values.length,
          examplesCount: dd.examples?.length ?? 0,
          preview:
            definitionPreview.length > 20
              ? definitionPreview.slice(0, 17).trim().concat('...')
              : definitionPreview,
        };
      })
      .filter((d) => d.definitionsCount > 0 || d.examplesCount > 0),
    otherExamplesId: createOtherExamplesId(idx),
    // `common-examples-${spelling}-${expressionDetails.inflection}` +
    // `-${commonExamplesCount}-${Math.random()}`,
    otherExamplesCount,
  };
}

export function capitalizeFirstLetter(str: string) {
  return str?.charAt(0).toUpperCase() + str?.slice(1);
}

export function flipAndMergeTags(input: Record<string, string>): Record<string, string> {
  const result: Record<string, string> = {};

  for (const [key, value] of Object.entries(input)) {
    if (result[value]) {
      result[value] += `;${key}`;
      // console.warn('duplicate tag values:', value, result[value]);
    } else {
      result[value] = key;
    }
  }
  return result;
}

export function langDialectToString(
  langDialect: LangDialect,
  t: TFunction,
  options?: { showOnlyLang: boolean } | { showOnlyDialect: boolean },
): string {
  if (!langDialect) {
    return '';
  }
  const langName = t(`languages.${IdToLang[langDialect.id]}`, { ns: 'common' });
  if (options && 'showOnlyLang' in options && options.showOnlyLang) {
    return langName;
  }
  const dialectName = langDialect.dialect
    ? ` ${t(`dialects.${langDialect?.dialect}`, { ns: 'common' })}`
    : '';
  if (options && 'showOnlyDialect' in options && options.showOnlyDialect) {
    return dialectName;
  }
  return langName + ' ' + dialectName;
}

export function buildSpellingRegex({
  starts,
  contains,
  ends,
}: {
  starts?: string;
  contains?: string;
  ends?: string;
}): RegExp {
  let pattern = '';

  if (starts) {
    pattern += `^${escapeRegExp(starts)}`;
  } else {
    pattern += '.*';
  }

  if (contains) {
    pattern += `(?=.*${escapeRegExp(contains)})`;
  }

  if (ends) {
    pattern += `${ends ? `.*${escapeRegExp(ends)}$` : ''}`;
  } else {
    pattern += '.*';
  }

  return new RegExp(pattern, 'i'); // case-insensitive
}

function escapeRegExp(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
