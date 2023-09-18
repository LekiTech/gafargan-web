// import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
// import { HYDRATE } from 'next-redux-wrapper'
// import { Expression } from '../types'

// export const expressionApi = createApi({
//   baseQuery: fetchBaseQuery({ baseUrl: 'https://api.gafalag.com/expression/' }),
//   extractRehydrationInfo(action, { reducerPath }) {
//     if (action.type === HYDRATE) {
//       return action.payload[reducerPath]
//     }
//   },
//   endpoints: (builder) => ({
//     searchExpression: builder.query<Expression, string>({
//       query: (word) => ({
//         url: `search`,
//         method: 'GET',
//         options: {
//           params: { 
//             exp: word,
//             fromLang: 'lez',
//             toLang: 'rus',
//            },
//         },
//       }),
//     }),
//   }),
// })

// export const { useSearchExpressionQuery } = expressionApi;