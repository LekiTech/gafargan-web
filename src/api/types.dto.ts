'use server';
import { DictionaryLang, Expression } from './types.model';

export type PaginatedResponse<T> = {
  totalItems: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
  items: T[];
};

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

export type ExamplesQuery = {
  searchString: string;
  exampleLang: string;
  pageSize: number;
  currentPage: number;
  tag?: string;
};

export type DefinitionsQuery = {
  searchString: string;
  defLang: string;
  pageSize: number;
  currentPage: number;
  tag?: string;
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

export type ExpressionExampleResponseDto = {
  id: string;
  spelling: string;
  example: ExampleResponseDto;
};

export type ExampleResponseDto = {
  id: string;
  raw: string;
  src: string;
  trl: string;
  srcLangId: string;
  trlLangId: string;
  tags: string[];
};

export type ExpressionDefinitionResponseDto = {
  id: string;
  spelling: string;
  expLangId: string;
  definition: DefinitionResponseDto;
};

export type DefinitionResponseDto = {
  id: string;
  value: string;
  defLangId: string;
  tags: string[];
};
