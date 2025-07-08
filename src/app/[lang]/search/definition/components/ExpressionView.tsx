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
  Divider,
  Grid,
  List,
  ListItem,
  ListItemText,
  ListSubheader,
  Pagination,
  Paper,
  Skeleton,
  Stack,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { Sidebar } from './Sidebar';
import { langDialectToString, toContents } from '../utils';
import { ExpressionDetailsComp } from './ExpressionDetailsComp';
import { FoundExamplesList, FoundExamplesListMobile } from './FoundExamplesList';
import { SpellingListItem } from '../../../components/SpellingListItem';
import { FoundDefinitionsList, FoundDefinitionsListMobile } from './FoundDefinitionsList';
import { useTranslation } from 'react-i18next';
import { Word } from '@repository/entities/Word';
import { FoundDefinition, FoundExample, FoundSpelling } from '@repository/types.model';
import { toLowerCaseLezgi } from '../../../../utils';
import { IdToLang } from '@api/languages';
// import { useViewport } from '../../../use/useViewport';
// import { EBreakpoints } from '../../../utils/BreakPoints';
// import { IExpressionPageContentStyles } from '@/definition/types';

type ExpressionViewProps = {
  lang: WebsiteLang;
  foundInExamples?: FoundExample[];
  foundInDefinitions?: FoundDefinition[];
  /**
   * Single word that
   */
  words?: Word[] | null;
  similarWords: FoundSpelling[];
  labels: {
    otherExamples: string;
  };
};

export const ExpressionView: FC<ExpressionViewProps> = ({
  lang,
  foundInExamples,
  foundInDefinitions,
  words,
  similarWords,
  labels,
}) => {
  const { t } = useTranslation(lang);
  const theme = useTheme();
  const isSmallerThanMd = useMediaQuery(theme.breakpoints.down('md'));

  console.log('ExpressionView > word', words);
  return (
    <Box
      sx={(theme) => ({
        width: '100vw',
        display: 'flex',
        justifyContent: 'center',
        mb: '50px',
      })}
    >
      <Stack
        // direction={'row'}
        spacing={2}
        sx={(theme) => ({
          maxWidth: '1400px',
          flexDirection: 'row',
          alignItems: 'baseline',
          [theme.breakpoints.down('md')]: {
            width: '100%',
            flexDirection: 'column',
          },
        })}
      >
        {words && words.length > 0 && (
          <Sidebar
            contents={words
              .map((word) => word.details?.map((d, i) => toContents(i, word.spelling, d)))
              .flat()}
            otherExamplesLabel={labels.otherExamples}
          />
        )}
        <Box
          sx={(theme) => ({
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'left',
            justifyContent: 'center',
            width: '65vw',
            maxWidth: '100%',
            boxSizing: 'border-box',
            ml: '25px !important',
            pt: '25px',
            pl: '25px',
            pb: '50px',
            [theme.breakpoints.down('md')]: {
              // order: 3,
              width: '100%',
              ml: '0px !important',
              pt: '15px',
              pl: '15px',
              '&.MuiBox-root': {
                ml: '0px !important',
                mt: '10px',
              },
            },
          })}
        >
          {words?.map((word, wi) =>
            word.details?.map((detail, i) => (
              <ExpressionDetailsComp
                key={`exp_det_${i}`}
                idx={i}
                websiteLang={lang}
                spelling={word.spelling}
                spellingVariants={word.spellingVariants}
                wordLangDialect={word.langDialect}
                data={detail}
                isLast={i === word?.details?.length - 1 && wi === words.length - 1}
              />
            )),
          )}
          <Divider
            sx={{
              mt: 3,
              mb: 3,
              [theme.breakpoints.down('md')]: {
                p: 0,
                ml: '-15px',
              },
            }}
          />
          <Grid
            container
            spacing={3}
            sx={(theme) => ({
              maxWidth: '1400px',
              // p: '0 50px',
              [theme.breakpoints.down('md')]: {
                p: 0,
                ml: '-15px',
              },
            })}
          >
            <Grid size={{ xs: 12 }}>
              <Stack
                direction="column"
                sx={(theme) => ({
                  [theme.breakpoints.down('md')]: {
                    pl: '15px',
                  },
                })}
              >
                <Typography id="probably-you-meant" variant="h6">
                  {t('probablyYouMeant')}:
                </Typography>
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
                        spelling={s.variant_spelling ?? s.word_spelling}
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
        </Box>
      </Stack>
    </Box>
  );
};
