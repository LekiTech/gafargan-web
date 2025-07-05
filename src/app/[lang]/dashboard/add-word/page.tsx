import { FC } from 'react';
import { redirect } from 'next/navigation';
import { Routes } from '../../../routes';
import { Params, SearchParams } from '@/types';
import { WordEntryForm } from '../components/WordEntryForm';

const AddWordPage: FC<{ params: Params; searchParams: SearchParams }> = async ({
  params,
  searchParams,
}) => {
  const { lang } = await params;
  const searchParamValues = await searchParams;

  // Temporary disabled in prod until finishd with development
  if (process.env.NODE_ENV === 'production') {
    redirect(`/${lang}/${Routes.UserSearchPage}`);
  }

  // const words = await getPaginatedWords({
  //   page: 0,
  //   size: 100,
  //   wordLangDialectId: 1,
  //   definitionsLangDialectId: 25,
  // });
  return (
    // <div>Hello world!</div>
    // <CustomPaginationActionsTable words={words} />
    // <AddWordForm />
    <WordEntryForm lang={lang} />
  );
};

export default AddWordPage;
