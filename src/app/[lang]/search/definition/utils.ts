import { ExpressionDetails } from '../../../../api/types.model';
import { Contents } from './types';
import { cleanText } from '../../../utils/cleanText';
import { WordDetail } from '@repository/entities/WordDetail';

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
    } else {
      result[value] = key;
    }
  }

  return result;
}
