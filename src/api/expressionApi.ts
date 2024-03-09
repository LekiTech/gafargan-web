'use server';
import BaseApi from './BaseApi';
import {
  ExpressionSearchResponseDto,
  SearchQuery,
  SuggestionResponseDto,
  SuggestionsQuery,
} from './types.dto';
import { Expression } from './types.model';
// import sampleExpression from './qhil.json';
// import { Expression } from './types.model';
// /v2/expressions/search/suggestions
const prefix = 'v2/expressions';

class ExpressionApi extends BaseApi {
  constructor() {
    super();
  }

  search = async (query: SearchQuery): Promise<ExpressionSearchResponseDto | undefined> => {
    try {
      const response = await this.get(`${prefix}/search`, {
        params: query,
      });
      return response.data;
    } catch (e) {
      console.error(e);
    }
  };

  suggestions = async (query: SuggestionsQuery): Promise<SuggestionResponseDto[]> => {
    try {
      const response = await this.get(`${prefix}/search/suggestions`, {
        params: query,
      });
      return response.data;
    } catch (e) {
      console.error(e);
      return [];
    }
  };

  /**
   * Get the word of the day.
   * @param currentDate - The current date in the format 'YYYY-MM-DD'.
   */
  wordOfTheDay = async (currentDate: string): Promise<Expression | undefined> => {
    try {
      const response = await this.get(`${prefix}/day`, {
        params: { currentDate },
      });
      return response.data;
    } catch (e) {
      console.error(e);
    }
  };
}

const api = new ExpressionApi();
// NOTE: Files marked with 'use server' can only export async functions.
export const search = api.search;
export const suggestions = api.suggestions;
export const wordOfTheDay = api.wordOfTheDay;
