// map from repository entities to proposal models

import {
  STATE,
  SourceModelType,
  TranslationModelType,
  SpellingVariantModelType,
  WordDetailModelNestedType,
  DefinitionModelNestedType,
  WordModelNestedType,
  WordModelExistingNestedType,
  DefinitionModelExistingNestedType,
  TranslationModelExistingType,
  WordDetailModelExistingNestedType,
  SpellingVariantModelExistingType,
} from './proposal.model';
import { Source } from '@repository/entities/Source';
import { Translation } from '@repository/entities/Translation';
import { Definition } from '@repository/entities/Definition';
import { WordDetail } from '@repository/entities/WordDetail';
import { SpellingVariant } from '@repository/entities/SpellingVariant';
import { Word } from '@repository/entities/Word';

export function mapSourceToModelType(source: Source): SourceModelType {
  const sourceModelType: SourceModelType = {
    state: STATE.UNCHANGED,
    id: source.id,
    name: source.name,
    authors: source.authors ?? undefined,
    publicationYear: source.publicationYear ?? undefined,
    providedBy: source.providedBy ?? undefined,
    providedByUrl: source.providedByUrl ?? undefined,
    processedBy: source.processedBy ?? undefined,
  };
  return sourceModelType;
}

export function mapTranslationToModelType(translation: Translation): TranslationModelExistingType {
  const translationModelType: TranslationModelExistingType = {
    state: STATE.UNCHANGED,
    id: translation.id,
    phrasesPerLangDialect: translation.phrasesPerLangDialect,
    tags: translation.tags ?? undefined,
  };
  return translationModelType;
}

export function mapDefinitionToModelNestedType(
  definition: Definition,
): DefinitionModelExistingNestedType {
  const definitionModelType: DefinitionModelExistingNestedType = {
    state: STATE.UNCHANGED,
    id: definition.id,
    values: definition.values,
    examples: definition.examples.map(mapTranslationToModelType),
    tags: definition.tags ?? undefined,
  };
  return definitionModelType;
}

export function mapWordDetailToModelNestedType(
  wordDetail: WordDetail,
): WordDetailModelExistingNestedType {
  const wordDetailModelType: WordDetailModelExistingNestedType = {
    state: STATE.UNCHANGED,
    id: wordDetail.id,
    inflection: wordDetail.inflection ?? undefined,
    langDialectId: wordDetail.langDialectId,
    sourceId: wordDetail.sourceId ?? undefined,
    definitions: wordDetail.definitions.map(mapDefinitionToModelNestedType),
    examples: wordDetail.examples.map(mapTranslationToModelType),
  };
  return wordDetailModelType;
}

export function mapSpellingVariantToModelNestedType(
  spellingVariant: SpellingVariant,
): SpellingVariantModelExistingType {
  const spellingVariantModelType: SpellingVariantModelExistingType = {
    state: STATE.UNCHANGED,
    id: spellingVariant.id,
    langDialectId: spellingVariant.langDialectId,
    spelling: spellingVariant.spelling,
    sourceId: spellingVariant.sourceId,
  };
  return spellingVariantModelType;
}

export function mapWordToModelNestedType(word: Word): WordModelExistingNestedType {
  const wordModelType: WordModelExistingNestedType = {
    state: STATE.UNCHANGED,
    id: word.id,
    spelling: word.spelling,
    langDialectId: word.langDialectId,
    sourceId: word.sourceId,
    spellingVariants: word.spellingVariants.map(mapSpellingVariantToModelNestedType),
    wordDetails: word.details.map(mapWordDetailToModelNestedType),
  };
  return wordModelType;
}
