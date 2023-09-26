import { cache } from 'react';
import BaseApi from './BaseApi';
import { Expression, SearchQuery } from './types';
import sampleExpression from './qhil.json';

const prefix = 'expression';

class ExpressionApi extends BaseApi {
  constructor() {
    super();
  }

  search = cache(async (query: SearchQuery) => {
    try {
      const response = await this.get(`${prefix}/search`, {
        params: {
          exp: query.exp,
          fromLang: query.fromLang,
          toLang: query.toLang,
        },
      });
      return response.data;
    } catch (e) {
      console.error(e);
    }
  });

  testSearch = async (query: SearchQuery): Promise<Expression> => {
    return sampleExpression;
  };
}

export default new ExpressionApi();
