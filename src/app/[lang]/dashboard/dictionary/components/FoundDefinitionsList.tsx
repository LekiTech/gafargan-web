'use client';
import React, { FC, useState } from 'react';
import { DictionaryLang, WebsiteLang } from '@api/types.model';
import {
  Box,
  Divider,
  List,
  ListItem,
  ListItemText,
  Pagination,
  Stack,
  Typography,
} from '@mui/material';
import { ParsedTextComp } from '../../../components/ParsedTextComp';
import { TagComp } from '../../../components/TagComp';
import { useTranslation } from 'react-i18next';
import { useRouter, useSearchParams } from 'next/navigation';
import { SpellingListItem } from '../../../components/SpellingListItem';
import { IdToLang } from '@api/languages';
import { Word } from '@repository/entities/Word';
import { colors } from '@/colors';
import { SearchLang } from '@/components/Search/types';
import { AdvancedSearchInput } from '@/components/Search/AdvancedSearchInput';
import { PaginatedResponse } from '@repository/types.model';
import { toNumber } from '../../../../utils';
import { DictionarySelect } from '@/components/Search/DictionarySelect';

export const FoundDefinitionsList: FC<{
  lang: WebsiteLang;
  paginatedWords: PaginatedResponse<Word>;
}> = ({ lang, paginatedWords }) => {
  const { t } = useTranslation(lang);
  const searchParams = useSearchParams();
  const router = useRouter();
  const [searchLang, setSearchLang] = useState<SearchLang>({
    from: (searchParams.get('fromLang') ?? 'lez') as DictionaryLang,
    to: (searchParams.get('toLang') ?? 'rus') as DictionaryLang,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [prevSearch, setPrevSearch] = useState('');
  const areSearchParamsAllowingNewSearch =
    !searchParams.toString() || searchParams.toString() !== prevSearch;
  const words = paginatedWords.items;
  const page = toNumber(searchParams.get('page') ?? 1);
  const handleChange = (event: React.ChangeEvent<unknown>, newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', newPage.toString());
    setIsLoading(true);
    router.replace(`?${params.toString()}`);
  };
  return words.length > 0 ? (
    <Stack direction="column" sx={{ alignItems: 'center' }}>
      <AdvancedSearchInput
        searchParams={searchParams}
        searchLang={searchLang}
        websiteLang={lang}
        areSearchParamsAllowingNewSearch={areSearchParamsAllowingNewSearch}
        setIsLoading={setIsLoading}
        colors={colors}
        basePrefix=""
      />
      <Box sx={{ mt: '15px', mb: '20px' }}>
        <DictionarySelect
          searchLang={searchLang}
          lang={lang}
          setIsLoading={setIsLoading}
          colors={{ ...colors, text: { light: colors.text.dark, dark: colors.text.light } }}
        />
      </Box>
      <Divider sx={{ width: '100%', mb: '5px' }} />
      <Pagination
        count={paginatedWords.totalPages}
        defaultPage={paginatedWords.currentPage}
        siblingCount={1}
        showFirstButton
        showLastButton
        page={page}
        onChange={handleChange}
      />
      <List sx={{ width: '100%' }} disablePadding>
        {words.flatMap((word, i) => {
          return [
            <Divider key={`${word.id}_divider_${i}`} component="li" sx={{ mt: '5px' }} />,
            <ListItem key={`${word.id}_item_${i}`} sx={{ pt: 0, minHeight: '125px' }}>
              <Stack direction="column">
                <SpellingListItem
                  key={`${word.id}_spelling_${i}`}
                  id={word.id}
                  spelling={word.spelling}
                  fromLang={IdToLang[word.langDialect.id]}
                  // toLang={IdToLang[word.definitions_lang_dialect_id]}
                  sx={{ ml: 0, pl: 0 }}
                />
                {word.details.map((wordDetail) => (
                  <Box key={`${word.id}_${wordDetail.id}`}>
                    <ListItemText
                      primary={
                        <Stack direction="row" spacing={2} sx={{ mt: '10px !important' }}>
                          {wordDetail?.definitions[0]?.values[0]?.tags &&
                            wordDetail?.definitions[0]?.values[0]?.tags.length > 0 &&
                            wordDetail?.definitions[0]?.values[0]?.tags.map((tag, t_i) => (
                              <TagComp
                                key={`${word.id}_definition_${i}_tags_${tag}_${t_i}`}
                                label={t(tag, { ns: 'tags' })}
                              />
                            ))}
                          <ParsedTextComp
                            text={wordDetail?.definitions[0]?.values[0].value ?? ''}
                          />
                        </Stack>
                      }
                    />
                    <Typography variant="caption" color="text.secondary" sx={{ mt: '10px' }}>
                      {/* {t(`languages.${IdToLang[word.langDialect.id]}`, { ns: 'common' })} →{' '}
                  {t(`languages.${IdToLang[wordDetail?.langDialect.id]}`, { ns: 'common' })} */}
                      {wordDetail?.source?.name} - {wordDetail?.source?.authors}
                    </Typography>
                  </Box>
                ))}
              </Stack>
            </ListItem>,
          ];
        })}
      </List>
      <Pagination
        count={paginatedWords.totalPages}
        defaultPage={paginatedWords.currentPage}
        siblingCount={1}
        showFirstButton
        showLastButton
        page={page}
        onChange={handleChange}
      />
    </Stack>
  ) : null;
};

// export const FoundDefinitionsListMobile: FC<{
//   lang: WebsiteLang;
//   definitions?: FoundDefinition[];
// }> = ({ lang, definitions }) => {
//   const [open, setOpen] = React.useState(false);

//   const handleClick = () => {
//     setOpen(!open);
//   };
//   return (
//     <Collapse
//       in={open}
//       timeout="auto"
//       collapsedSize={'150px'}
//       orientation="vertical"
//       sx={{ position: 'relative' }}
//     >
//       <FoundDefinitionsList lang={lang} definitions={definitions} />
//       {!open && (
//         <Box
//           sx={{
//             position: 'absolute',
//             top: 0,
//             height: '150px',
//             width: '100%',
//             backgroundImage:
//               'linear-gradient(to bottom, rgba(255,255,255,0), rgba(255,255,255,1) 80% 100%)',
//           }}
//         />
//       )}
//       <IconButton
//         aria-label="expand"
//         onClick={handleClick}
//         size="small"
//         sx={{ position: 'absolute', bottom: '0px', left: '47%', display: 'block', margin: 'auto' }}
//       >
//         {open ? <ExpandLess /> : <ExpandMore />}
//       </IconButton>
//     </Collapse>
//   );
// };
