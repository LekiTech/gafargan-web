'use client';
import React, { FC, useMemo } from 'react';
import {
  ExpressionDefinitionResponseDto,
  ExpressionExampleResponseDto,
  ExpressionSearchResponseDto,
} from '@api/types.dto';
import { WebsiteLang } from '@api/types.model';
import { Box, Grid, List, ListItem, Paper, Skeleton, Stack, Typography, useMediaQuery, useTheme } from '@mui/material';
import { Sidebar } from './Sidebar';
import { toContents } from '../utils';
import { ExpressionDetailsComp } from './ExpressionDetailsComp';
import { FoundExamplesList, FoundExamplesListMobile } from './FoundExamplesList';
import { SpellingListItem } from './SpellingListItem';
import { FoundDefinitionsList, FoundDefinitionsListMobile } from './FoundDefinitionsList';
import { useTranslation } from 'react-i18next';
import { useViewport } from '../../../use/useViewport';
import { EBreakpoints } from '../../../utils/BreakPoints';
import { IExpressionPageContentStyles } from '@/definition/types';

type ExpressionViewProps = {
  lang: WebsiteLang;
  foundInExamples: ExpressionExampleResponseDto[];
  foundInDefinitions: ExpressionDefinitionResponseDto[];
  expression?: ExpressionSearchResponseDto;
  labels: {
    otherExamples: string;
  };
};

export const ExpressionView: FC<ExpressionViewProps> = ({
  lang,
  foundInExamples,
  foundInDefinitions,
  expression,
  labels,
}) => {
  const { t } = useTranslation(lang);
  const theme = useTheme();
  const isSmallerThanMd = useMediaQuery(theme.breakpoints.down('md'));

  const { viewport } = useViewport()

  const pageStyles = useMemo<IExpressionPageContentStyles>(() => ({
    contentDirection: viewport.isGreaterThan(EBreakpoints.XXL) ? 'row' : 'column',
    mainContentLeftPadding: viewport.isGreaterThan(EBreakpoints.XXL) ? '25px' : '0',
    contentWidth: viewport.isGreaterThan(EBreakpoints.XXL) ? '100%' : '99%',
    contentTopMargin: viewport.isGreaterThan(EBreakpoints.XXL) ? '20px' : '0',
  }), [viewport])


  if (!expression) {
    return (
      <Box>
        <Typography variant="h1">
          <Skeleton />
        </Typography>
      </Box>
    );
  }
  const { found: foundExpression, similar: similarExpressions } = expression;
  return (
    <Box
      sx={(theme) => ({
        width: '100vw',
        display: 'flex',
        justifyContent: 'center',
        mt: pageStyles.contentTopMargin,
        mb: '50px',
      })}
    >
      {foundExpression && foundExpression?.details ? (
        <Stack
          direction={pageStyles.contentDirection}
          spacing={2}
          sx={{
            width: '100%',
            maxWidth: '1400px',
            alignItems: 'baseline'
          }}
        >
          <Sidebar
            contents={foundExpression?.details?.map((d, i) =>
              toContents(i, foundExpression.spelling, d),
            )}
            otherExamplesLabel={labels.otherExamples}
          />
          <Box
            sx={(theme) => ({
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'left',
              justifyContent: 'center',
              width: pageStyles.contentWidth,
              boxSizing: 'border-box',
              pt: '25px',
              pl: pageStyles.mainContentLeftPadding,
              pb: '50px',
              [theme.breakpoints.down('md')]: {
                '&.MuiBox-root': {
                  ml: '0'
                }
              },
            })}
          >
            {foundExpression?.details?.map((detail, i) => (
              <ExpressionDetailsComp
                key={`exp_det_${i}`}
                idx={i}
                lang={lang}
                spelling={foundExpression.spelling}
                data={detail}
                isLast={i === foundExpression?.details?.length - 1}
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
          <Grid item xs={12}>
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
                {similarExpressions?.map((s, i) => (
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
          <Grid item xs={12} md={6}>
            <Paper elevation={3} sx={(theme) => ({ p: '20px', [theme.breakpoints.down('md')]: { pb: 0 } })}>
              <Stack direction="column">
                <Typography variant="h6">{t('foundInExamples')}</Typography>
                {isSmallerThanMd ? <FoundExamplesListMobile lang={lang} examples={foundInExamples} /> : <FoundExamplesList lang={lang} examples={foundInExamples} />}
              </Stack>
            </Paper>
          </Grid>
          <Grid item xs={12} md={6}>
            <Paper elevation={3} sx={(theme) => ({ p: '20px', [theme.breakpoints.down('md')]: { pb: 0 } })}>
              <Stack direction="column">
                <Typography variant="h6">{t('foundInDefinitions')}</Typography>
                {isSmallerThanMd ? <FoundDefinitionsListMobile lang={lang} definitions={foundInDefinitions} /> : <FoundDefinitionsList lang={lang} definitions={foundInDefinitions} />}
              </Stack>
            </Paper>
          </Grid>
        </Grid>
      )}
    </Box>
  );
};
