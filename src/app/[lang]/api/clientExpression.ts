"use client";

import { cache } from "react";
import BaseApi from "./BaseApi";
import { SearchQuery } from "./types";

const prefix = 'expression';



class ClientExpressionApi extends BaseApi {
  constructor() {
    // See: https://nextjs.org/docs/pages/building-your-application/configuring/environment-variables#bundling-environment-variables-for-the-browser
    super(process.env.NEXT_PUBLIC_API_URL);
  }

  search = cache (async (query: SearchQuery) => {
    try {
      const response = await this.get(`${prefix}/search/suggestions`, {
        params: query
      });
      return response.data;
    } catch (e) {
      console.error(e);
    }
  })
}

export default new ClientExpressionApi();
