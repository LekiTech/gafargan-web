import { cache } from "react";
import BaseApi from "./BaseApi";

const prefix = 'expression';

class ExpressionApi extends BaseApi {
  constructor() {
    super();
  }

  search = cache (async (query: string) => {
    try {
      const response = await this.get(`${prefix}/search`, {
        params: { 
          exp: query,
          fromLang: 'lez',
          toLang: 'rus',
        }
      });
      return response.data;
    } catch (e) {
      console.error(e);
    }
  })
}

export default new ExpressionApi();
