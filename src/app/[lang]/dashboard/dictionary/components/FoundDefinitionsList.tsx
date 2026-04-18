'use client';
import React, { FC, useMemo, useState } from 'react';
import { DictionaryLang, WebsiteLang } from '@api/types.model';
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Divider,
  IconButton,
  List,
  Modal,
  Pagination,
  Stack,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import CloseIcon from '@mui/icons-material/Close';
import { useTranslation } from 'react-i18next';
import { useRouter, useSearchParams } from 'next/navigation';
import { colors } from '@/colors';
import { SearchLang } from '@/components/Search/types';
import { AdvancedSearchInput } from '@/components/Search/AdvancedSearchInput';
import { PaginatedResponse } from '@repository/types.model';
import { toNumber } from '../../../../utils';
import { DictionarySelect } from '@/components/Search/DictionarySelect';
import {
  DictionaryProposalModel,
  SourceModel,
  SourceModelType,
  WordModel,
  WordModelExistingNestedType,
} from '@/dashboard/models/proposal.model';
import { WordEntry } from './WordEntryForm/WordEntry';
import { WordEntryForm } from './WordEntryForm';
import { FORM_ENTRY_STATE } from './WordEntryForm/constants';

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
  const [selectedWord, setSelectedWord] = useState<WordModelExistingNestedType | undefined>();

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

  const editDictionaryModel = useMemo(() => {
    if (!selectedWord) {
      return undefined;
    }

    const wordModel = WordModel.fromNestedTypes(selectedWord);

    const fallbackSource = sourceModels[0];
    const wordSource =
      // @ts-ignore
      sourceModels.find((source) => source.id === selectedWord.sourceId) ?? fallbackSource;

    const firstWordDetail = selectedWord.wordDetails[0];

    return new DictionaryProposalModel(
      [wordModel],
      new SourceModel(wordSource),
      selectedWord.langDialectId,
      firstWordDetail?.langDialectId ?? selectedWord.langDialectId,
    );
  }, [selectedWord, sourceModels]);
  return words.length > 0 ? (
    <>
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
            <Box key={`${word.id}`} sx={{ position: 'relative' }}>
              <Box
                sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1, mt: idx === 0 ? 0 : 2 }}
              >
                <IconButton size="small" onClick={() => setSelectedWord(word)}>
                  <EditIcon />
                </IconButton>
              </Box>

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
            </Box>
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
      {selectedWord && editDictionaryModel && (
        <Modal open={true} onClose={() => setSelectedWord(undefined)}>
          <Card
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: 'min(1200px, 95vw)',
              maxHeight: '90vh',
              overflow: 'hidden',
            }}
          >
            <CardHeader
              title={t('common.edit', { ns: 'dashboard', defaultValue: 'Edit entry proposal' })}
              subheader={selectedWord.spelling}
              action={
                <IconButton onClick={() => setSelectedWord(undefined)}>
                  <CloseIcon />
                </IconButton>
              }
            />
            <CardContent sx={{ maxHeight: '75vh', overflowY: 'auto' }}>
              <WordEntryForm
                lang={lang}
                sourceModels={sourceModels}
                formEntryState={FORM_ENTRY_STATE.EDIT}
                dictionaryModel={editDictionaryModel}
              />
            </CardContent>
          </Card>
        </Modal>
      )}
    </>
  ) : null;
};
