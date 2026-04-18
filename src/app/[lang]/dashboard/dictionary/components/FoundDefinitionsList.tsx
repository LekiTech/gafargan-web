'use client';
import React, { FC, useState } from 'react';
import { DictionaryLang, WebsiteLang } from '@api/types.model';
import { Box, Divider, List, Pagination, Stack } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useRouter, useSearchParams } from 'next/navigation';
import { colors } from '@/colors';
import { SearchLang } from '@/components/Search/types';
import { AdvancedSearchInput } from '@/components/Search/AdvancedSearchInput';
import { PaginatedResponse } from '@repository/types.model';
import { toNumber } from '../../../../utils';
import { DictionarySelect } from '@/components/Search/DictionarySelect';
import {
  SourceModel,
  SourceModelType,
  WordModel,
  WordModelExistingNestedType,
} from '@/dashboard/models/proposal.model';
import { WordEntry } from './WordEntryForm/WordEntry';

export const FoundDefinitionsList: FC<{
  lang: WebsiteLang;
  paginatedWords: PaginatedResponse<WordModelExistingNestedType>;
  sourceModels: SourceModelType[];
}> = ({ lang, paginatedWords, sourceModels }) => {
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
        {words.flatMap((word, idx) => (
          <WordEntry
            key={`${word.id}`}
            rowId={`${word.id}`}
            idx={idx + 1}
            wordEntry={WordModel.fromNestedTypes(word)}
            onChange={(e) => {}}
            onDelete={() => {}}
            lang={lang}
            defLangDialectId={word.wordDetails[0].langDialectId}
            defSourceId={word.wordDetails[0].sourceId}
            allSources={sourceModels.map((s) => new SourceModel(s))}
            isFirst={idx === 0}
            isLast={idx === word.wordDetails.length - 1}
            readonly={true}
          />
        ))}
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
