// 'use server';
// import { cache } from 'react';
// import BaseApi from './BaseApi';
// import {
//   ExpressionSearchResponseDto,
//   SearchQuery,
//   SuggestionResponseDto,
//   SuggestionsQuery,
// } from './types.dto';
// import { WrittenSource } from './types.model';

// const prefix = 'v2/dictionary';

// class DictionaryApi extends BaseApi {
//   constructor() {
//     super();
//   }

//   /**
//    * Get the word of the day.
//    * @param currentDate - The current date in the format 'YYYY-MM-DD'.
//    */
//   getSources = cache(async (): Promise<WrittenSource[]> => {
//     try {
//       const response = await this.get(`${prefix}/sources`);
//       return response.data;
//     } catch (e) {
//       console.error(e);
//       return [];
//     }
//   });
// }

// const api = new DictionaryApi();
// // NOTE: Files marked with 'use server' can only export async functions.
// export const getSources = api.getSources;
