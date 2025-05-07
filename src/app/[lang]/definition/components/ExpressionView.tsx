'use client';
import React, { FC, useMemo, useState } from 'react';
import {
  ExpressionDefinitionResponseDto,
  ExpressionExampleResponseDto,
  ExpressionSearchResponseDto,
} from '@api/types.dto';
import { WebsiteLang } from '@api/types.model';
import {
  Box,
  Grid,
  List,
  ListItem,
  Pagination,
  Paper,
  Skeleton,
  Stack,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { Sidebar } from './Sidebar';
import { toContents } from '../utils';
import { ExpressionDetailsComp } from './ExpressionDetailsComp';
import { FoundExamplesList, FoundExamplesListMobile } from './FoundExamplesList';
import { SpellingListItem } from './SpellingListItem';
import { FoundDefinitionsList, FoundDefinitionsListMobile } from './FoundDefinitionsList';
import { useTranslation } from 'react-i18next';
import { Word } from '@repository/entities/Word';
import { FoundDefinition, FoundExample, FoundSpelling } from '@repository/types.model';
// import { useViewport } from '../../../use/useViewport';
// import { EBreakpoints } from '../../../utils/BreakPoints';
// import { IExpressionPageContentStyles } from '@/definition/types';

type ExpressionViewProps = {
  lang: WebsiteLang;
  foundInExamples?: FoundExample[];
  foundInDefinitions?: FoundDefinition[];
  word?: Word | null;
  similarWords: FoundSpelling[];
  labels: {
    otherExamples: string;
  };
};

export const ExpressionView: FC<ExpressionViewProps> = ({
  lang,
  foundInExamples,
  foundInDefinitions,
  word,
  similarWords,
  labels,
}) => {
  const { t } = useTranslation(lang);
  const theme = useTheme();
  const isSmallerThanMd = useMediaQuery(theme.breakpoints.down('md'));

  // NOTE: Part below didn't work as intended after merging, holding on previous version
  // const { viewport } = useViewport()
  // const pageStyles = useMemo<IExpressionPageContentStyles>(() => ({
  //   contentDirection: viewport.isGreaterThan(EBreakpoints.XXL) ? 'row' : 'column',
  //   mainContentLeftPadding: viewport.isGreaterThan(EBreakpoints.XXL) ? '25px' : '0',
  //   contentWidth: viewport.isGreaterThan(EBreakpoints.XXL) ? '100%' : '99%',
  //   contentTopMargin: viewport.isGreaterThan(EBreakpoints.XXL) ? '50px' : '0',
  // }), [viewport])

  // if (!word) {
  //   return (
  //     <Box>
  //       <Typography variant="h1">
  //         <Skeleton />
  //       </Typography>
  //     </Box>
  //   );
  // }
  return (
    <Box
      sx={(theme) => ({
        width: '100vw',
        display: 'flex',
        justifyContent: 'center',
        mt: '20px',
        mb: '50px',
      })}
    >
      {word && word?.details ? (
        <Stack
          direction={'row'}
          spacing={2}
          sx={(theme) => ({
            maxWidth: '1400px',
            alignItems: 'baseline',
            [theme.breakpoints.down('md')]: {
              width: '100%',
            },
          })}
        >
          <Sidebar
            contents={word?.details?.map((d, i) => toContents(i, word.spelling, d))}
            otherExamplesLabel={labels.otherExamples}
          />
          <Box
            sx={(theme) => ({
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'left',
              justifyContent: 'center',
              width: '65vw',
              maxWidth: '100%',
              boxSizing: 'border-box',
              pt: '25px',
              pl: '25px',
              pb: '50px',
              [theme.breakpoints.down('md')]: {
                width: '100%',
                pt: '15px',
                pl: '15px',
                '&.MuiBox-root': {
                  ml: '0',
                  mt: '10px',
                },
              },
            })}
          >
            {word?.details?.map((detail, i) => (
              <ExpressionDetailsComp
                key={`exp_det_${i}`}
                idx={i}
                lang={lang}
                spelling={word.spelling}
                data={detail}
                isLast={i === word?.details?.length - 1}
              />
            ))}
          </Box>
        </Stack>
      ) : (
        <Grid
          container
          spacing={3}
          sx={(theme) => ({
            maxWidth: '1400px',
            p: '0 50px',
            [theme.breakpoints.down('md')]: {
              p: 0,
            },
          })}
        >
          <Grid size={{ xs: 12 }}>
            <Stack
              direction="column"
              sx={(theme) => ({
                [theme.breakpoints.down('md')]: {
                  pl: '20px',
                },
              })}
            >
              <Typography variant="h6">{t('probablyYouMeant')}:</Typography>
              <List
                sx={{
                  display: 'flex',
                  flexDirection: 'row',
                  p: 0,
                  overflow: 'auto',
                  maxWidth: '100vw',
                }}
              >
                {similarWords?.map((s, i) => (
                  <ListItem key={`similar_${i}`} sx={{ pt: 0, mb: '10px', pl: 0, ml: 0 }}>
                    <SpellingListItem
                      id={s.id}
                      spelling={s.spelling}
                      showIcon={false}
                      sx={{ minWidth: 'max-content', color: '#bb1614', fontWeight: 600, pl: 0 }}
                    />
                  </ListItem>
                ))}
              </List>
            </Stack>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <Paper
              elevation={3}
              sx={(theme) => ({ p: '20px', [theme.breakpoints.down('md')]: { pb: 0 } })}
            >
              <Stack direction="column">
                <Typography variant="h6">{t('foundInExamples')}</Typography>
                {isSmallerThanMd ? (
                  <FoundExamplesListMobile lang={lang} examples={foundInExamples} />
                ) : (
                  <FoundExamplesList lang={lang} examples={foundInExamples} />
                )}
                {/* <Pagination count={10} shape="rounded" /> */}
              </Stack>
            </Paper>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <Paper
              elevation={3}
              sx={(theme) => ({ p: '20px', [theme.breakpoints.down('md')]: { pb: 0 } })}
            >
              <Stack direction="column">
                <Typography variant="h6">{t('foundInDefinitions')}</Typography>
                {isSmallerThanMd ? (
                  <FoundDefinitionsListMobile lang={lang} definitions={foundInDefinitions} />
                ) : (
                  <FoundDefinitionsList lang={lang} definitions={foundInDefinitions} />
                )}
                {/* <Pagination count={10} shape="rounded" /> */}
              </Stack>
            </Paper>
          </Grid>
        </Grid>
      )}
    </Box>
  );
};
