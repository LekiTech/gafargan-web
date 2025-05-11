import { FC } from 'react';
import { Params } from './types';
import { redirect } from 'next/navigation';

const RootLevelPage: FC<{ params: Params }> = async ({ params }) => {
  const { lang } = await params;
  redirect(`/${lang}/home`);
};

export default RootLevelPage;
