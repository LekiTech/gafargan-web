import { FC } from 'react';
import { redirect } from 'next/navigation';
import { Routes } from '../../../routes';
import { Params, SearchParams } from '@/types';
import { WordEntryForm } from '../components/WordEntryForm';
import { getSources } from '@repository/word.repository';
import { SourceModel, SourceModelType, STATE } from '../models/proposal.model';

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

  const sources = await getSources();
  const sourceModels: SourceModelType[] = sources.map((source) => {
    return {
      state: STATE.UNCHANGED,
      id: source.id,
      name: source.name,
      authors: source.authors ?? undefined,
      // publicationYear: source.publicationYear ?? undefined,
      // providedBy: source.providedBy ?? undefined,
      // providedByUrl: source.providedByUrl ?? undefined,
      // processedBy: source.processedBy ?? undefined,
      // copyright: source.copyright ?? undefined,
      // seeSourceUrl: source.seeSourceUrl ?? undefined,
      // description: source.description ?? undefined,
    };
  });
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
    <WordEntryForm lang={lang} sourceModels={sourceModels} />
  );
};

export default AddWordPage;
