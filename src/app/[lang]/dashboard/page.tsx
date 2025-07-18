import { FC } from 'react';
import { CustomPaginationActionsTable } from './crud-table';
import { getPaginatedWords, searchAdvanced } from '@repository/word.repository';
import { redirect } from 'next/navigation';
import { Routes } from '../../routes';
import { AdvancedSearchParams, Params, SearchParams } from '@/types';
import { FoundDefinitionsList } from './FoundDefinitionsList';
import { initTranslations } from '@i18n/index';
import { LangToId } from '@api/languages';
import { toNumber } from '../../utils';

const EmployeesCrudPage: FC<{ params: Params; searchParams: SearchParams }> = async ({
  params,
  searchParams,
}) => {
  const { lang } = await params;
  const searchParamValues = await searchParams;
  const { fromLang, toLang, page, pageSize, s, c, e, tag, minl, maxl } =
    searchParamValues as AdvancedSearchParams;
  const { t } = await initTranslations(lang);

  const paginatedWords = await searchAdvanced({
    page: toNumber(page),
    pageSize: toNumber(pageSize),
    starts: s,
    contains: c,
    ends: e,
    minLength: minl,
    maxLength: maxl,
    tag: tag,
    wordLangDialectIds: LangToId[fromLang],
    definitionsLangDialectIds: LangToId[toLang],
  });
  if (page > paginatedWords.totalPages) {
    redirect(
      `/${lang}/dashboard?` +
        Object.entries({ ...searchParamValues, page: paginatedWords.totalPages })
          .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value ?? '')}`)
          .join('&'),
    );
  }

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
    <FoundDefinitionsList lang={lang} paginatedWords={paginatedWords} />
  );
};

export default EmployeesCrudPage;
// import { FC } from 'react';
// import { createTheme } from '@mui/material/styles';
// import StickyNote2Icon from '@mui/icons-material/StickyNote2';
// import { AppProvider, type Navigation } from '@toolpad/core/AppProvider';
// import { DashboardLayout } from '@toolpad/core/DashboardLayout';
// import { PageContainer } from '@toolpad/core/PageContainer';
// import { Crud, DataModel, DataSource, DataSourceCache } from '@toolpad/core/Crud';
// import { getMany, getOne, createOne, updateOne, deleteOne, validate } from './employees';

// export interface Note extends DataModel {
//   id: number;
//   title: string;
//   text: string;
// }

// // let notesStore: Note[] = [
// //   { id: 1, title: 'Grocery List Item', text: 'Buy more coffee.' },
// //   { id: 2, title: 'Personal Goal', text: 'Finish reading the book.' },
// // ];

// const notesCache = new DataSourceCache();

// const CrudBasic: FC = () => {
//   const title = 'Test title';
//   const notesDataSource: DataSource<Note> = {
//     fields: [
//       { field: 'id', headerName: 'ID' },
//       { field: 'title', headerName: 'Title', flex: 1 },
//       { field: 'text', headerName: 'Text', flex: 1 },
//     ],

//     getMany,

//     getOne,

//     createOne,

//     updateOne,

//     deleteOne,

//     validate,
//   };
//   // React.useMemo(() => {
//   //   if (router.pathname === '/notes/new') {
//   //     return 'New Note';
//   //   }
//   //   const editNoteId = matchPath('/notes/:noteId/edit', router.pathname);
//   //   if (editNoteId) {
//   //     return `Note ${editNoteId} - Edit`;
//   //   }
//   //   const showNoteId = matchPath('/notes/:noteId', router.pathname);
//   //   if (showNoteId) {
//   //     return `Note ${showNoteId}`;
//   //   }

//   //   return undefined;
//   // }, [router.pathname]);

//   return (
//     <PageContainer title={title}>
//       {/* preview-start */}
//       <Crud<Note>
//         dataSource={notesDataSource}
//         dataSourceCache={notesCache}
//         rootPath="/notes"
//         initialPageSize={10}
//         defaultValues={{ title: 'New note' }}
//       />
//       {/* preview-end */}
//     </PageContainer>
//   );
// };

// export default Crud;
