'use server';
import { DictionaryLang, Expression } from './types.model';

export type SearchQuery = {
  spelling: string;
  expLang: DictionaryLang;
  defLang: DictionaryLang;
  similarCount?: number;
};

export type SuggestionsQuery = {
  spelling: string;
  expLang: DictionaryLang;
  defLang: DictionaryLang;
  size: number;
};

// RESPONSES

export type SuggestionResponseDto = {
  id: string;
  spelling: string;
};

export type ExpressionSearchResponseDto = {
  found?: Expression;
  similar: SuggestionResponseDto[];
};

export type ExpressionGetByIdResponseDto = {
  found: Expression;
  similar: SuggestionResponseDto[];
};
