import { FC } from 'react';
import { Params, SearchParams } from './types';
import { redirect } from 'next/navigation';
import { Routes } from '../routes';

/**
 * One of the reasons for it to exist is backwards compatibility with previous version of the website
 */
const RootLevelPage: FC<{ params: Params; searchParams: SearchParams }> = async ({
  params: paramsPromise,
  searchParams: searchParamsPromise,
}) => {
  const { lang } = await paramsPromise;
  const searchParams = await searchParamsPromise;
  const inUrlSearchParams = Object.entries(searchParams)
    .map(([k, v]) => `${k}=${v}`)
    .join('&');
  redirect(`/${lang}/${Routes.UserSearchPage}?${inUrlSearchParams}`);
};

export default RootLevelPage;
