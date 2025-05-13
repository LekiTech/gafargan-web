import * as React from 'react';
import { CustomPaginationActionsTable } from './crud-table';
import { getPaginatedWords } from '@repository/word.repository';

export default async function EmployeesCrudPage() {
  const words = await getPaginatedWords({
    page: 0,
    size: 100,
    wordLangDialectId: 1,
    definitionsLangDialectId: 25,
  });
  return (
    // <div>Hello world!</div>
    <CustomPaginationActionsTable words={words} />
  );
}

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
