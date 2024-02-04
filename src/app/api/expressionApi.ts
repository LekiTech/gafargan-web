'use server';
import { cache } from 'react';
import BaseApi from './BaseApi';
import {
  ExpressionSearchResponseDto,
  SearchQuery,
  SuggestionResponseDto,
  SuggestionsQuery,
} from './types.dto';
// import sampleExpression from './qhil.json';
// import { Expression } from './types.model';
// /v2/expressions/search/suggestions
const prefix = 'v2/expressions';

class ExpressionApi extends BaseApi {
  constructor() {
    super();
  }

  search = cache(async (query: SearchQuery): Promise<ExpressionSearchResponseDto | undefined> => {
    try {
      const response = await this.get(`${prefix}/search`, {
        params: query,
      });
      return response.data;
    } catch (e) {
      console.error(e);
    }
  });

  suggestions = cache(async (query: SuggestionsQuery): Promise<SuggestionResponseDto[]> => {
    try {
      const response = await this.get(`${prefix}/search/suggestions`, {
        params: query,
      });
      return response.data;
    } catch (e) {
      console.error(e);
      return [];
    }
  });

  // testSearch = async (query: SearchQuery): Promise<Expression> => {
  //   return sampleExpression;
  // };
}

const api = new ExpressionApi();
// NOTE: Files marked with 'use server' can only export async functions.
export const search = api.search;
export const suggestions = api.suggestions;
