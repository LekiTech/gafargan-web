import { ExpressionDetails } from '../../api/types.model';
import { Contents } from './types';

export function createSpellingId(
  idx: number,
  spelling: string,
  definitionDetailsLength: number,
  inflection?: string,
) {
  const spellingId = `${idx}-spelling-${spelling}-${inflection}-${definitionDetailsLength}`
    .replaceAll(' ', '_')
    .replaceAll('undefined', '');
  return spellingId;
}

export function createDetailsId(
  idx: number,
  spelling: string,
  definitionsCount: number,
  inflection?: string,
  examplesCount?: number,
) {
  const detailsId = `${idx}-details-${spelling}-${inflection}-${definitionsCount}-${
    examplesCount ?? 0
  }`
    .replaceAll(' ', '_')
    .replaceAll('undefined', '');
  return detailsId;
}

export function createOtherExamplesId(idx: number) {
  return `${idx}-other-examples`;
}

export function toContents(
  idx: number,
  spelling: string,
  expressionDetails: ExpressionDetails,
): Contents {
  const otherExamplesCount = expressionDetails.examples?.length ?? 0;
  return {
    spellingId: createSpellingId(
      idx,
      spelling,
      expressionDetails.definitionDetails.length,
      expressionDetails.inflection,
    ),
    spelling,
    inflection: expressionDetails.inflection,
    details: expressionDetails.definitionDetails
      .map((dd, i) => {
        const definitionPreview = (
          dd.definitions[0]?.value ??
          dd.examples?.[0]?.raw ??
          ''
        ).replaceAll(/({|}|<|>)/g, '');
        return {
          detailsId: createDetailsId(
            i,
            spelling,
            dd.definitions.length,
            expressionDetails.inflection,
            dd.examples?.length,
          ),
          // `details-${spelling}-${expressionDetails.inflection}-` +
          // `${dd.definitions.length}-${dd.examples?.length ?? 0}-${Math.random()}`,
          definitionsCount: dd.definitions.length,
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

export function expressionSpellingToLowerCase(spelling: string) {
  return spelling.toLowerCase().replaceAll('i', 'I');
}

export function capitalizeFirstLetter(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
