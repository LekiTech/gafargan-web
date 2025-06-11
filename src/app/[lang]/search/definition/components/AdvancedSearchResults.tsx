'use client';
import React, { FC, useEffect, useState } from 'react';
import { WebsiteLang } from '@api/types.model';
import { Backdrop, Box, CircularProgress, Pagination } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { Word } from '@repository/entities/Word';
import { FoundWordsList } from './FoundWordsList';
import { PaginatedResponse } from '@repository/types.model';
import { useRouter, useSearchParams } from 'next/navigation';
import { toNumber } from '../../../../utils';

type AdvancedSearchResultsProps = {
  lang: WebsiteLang;
  paginatedWords: PaginatedResponse<Word>;
};

export const AdvancedSearchResults: FC<AdvancedSearchResultsProps> = ({ lang, paginatedWords }) => {
  const { t } = useTranslation(lang);
  const [isLoading, setIsLoading] = useState(false);
  useEffect(() => {
    setIsLoading(false);
  }, [paginatedWords]);
  const router = useRouter();
  const searchParams = useSearchParams();
  const page = toNumber(searchParams.get('page') ?? 1);
  const handleChange = (event: React.ChangeEvent<unknown>, newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', newPage.toString());
    setIsLoading(true);
    router.replace(`?${params.toString()}`);
  };
  return (
    <Box
      sx={(theme) => ({
        width: '100vw',
        display: 'flex',
        justifyContent: 'center',
        mb: '50px',
      })}
    >
      <Box
        sx={(theme) => ({
          width: '1400px',
          maxWidth: '1400px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          pt: '16px',
          pb: '16px',
          [theme.breakpoints.down('md')]: {
            width: '100%',
          },
        })}
      >
        <Pagination
          count={paginatedWords.totalPages}
          defaultPage={paginatedWords.currentPage}
          siblingCount={1}
          showFirstButton
          showLastButton
          page={page}
          onChange={handleChange}
        />
        <FoundWordsList lang={lang} words={paginatedWords.items} />
        <Pagination
          count={paginatedWords.totalPages}
          defaultPage={paginatedWords.currentPage}
          siblingCount={1}
          showFirstButton
          showLastButton
          page={page}
          onChange={handleChange}
        />
      </Box>
      <Backdrop
        sx={(theme) => ({ color: '#fff', zIndex: theme.zIndex.drawer + 1 })}
        open={isLoading}
      >
        <CircularProgress color="inherit" />
      </Backdrop>
    </Box>
  );
};
