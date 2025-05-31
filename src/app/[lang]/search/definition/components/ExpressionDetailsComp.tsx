'use client';
import React, { FC } from 'react';
import { ExpressionDetails, WebsiteLang } from '../../../../../api/types.model';
// Adding '/index' helps to avoid Nextjs 14.0.4 error. See: https://github.com/mui/material-ui/issues/40214#issuecomment-1866196893
import { Box, Divider, List, ListItem, ListItemText, Stack, Typography } from '@mui/material';
import { expressionFont } from '@/fonts';
import { DefinitionDetailsComp } from './DefinitionComp';
import { createOtherExamplesId, createSpellingId, langDialectToString } from '../utils';
import { ExamplesComp } from './ExampleComp';
import { useTranslation } from 'react-i18next';
import { toLowerCaseLezgi } from '../../../../utils';
import { useViewport } from '../../../../use/useViewport';
import { EBreakpoints } from '../../../../utils/BreakPoints';
import { WordDetail } from '@repository/entities/WordDetail';
import { SpellingVariant } from '@repository/entities/SpellingVariant';
import { LangDialect } from '@repository/entities/LangDialect';

type ExpressionDetailsCompProps = {
  idx: number;
  websiteLang: WebsiteLang;
  spelling: string;
  spellingVariants: SpellingVariant[];
  wordLangDialect: LangDialect;
  data: WordDetail;
  isLast: boolean;
};

export const ExpressionDetailsComp: FC<ExpressionDetailsCompProps> = ({
  idx,
  websiteLang,
  spelling,
  spellingVariants,
  wordLangDialect,
  data,
  isLast,
}) => {
  const { t } = useTranslation(websiteLang);
  // const { t: tTags } = await useTranslation(lang, 'tags');
  const spellingId = createSpellingId(idx, spelling, data.definitions.length, data.inflection);

  const { viewport } = useViewport();
  return (
    <Stack
      sx={{
        display: 'flex',
        flexDirection: 'column',
        // borderBottom: '1px solid #ccc',
        // padding: '20px 0',
        width: '100%',
      }}
    >
      <SpellingVariantsList
        spelling={spelling}
        spellingVariants={spellingVariants}
        websiteLang={websiteLang}
        wordLangDialect={wordLangDialect}
      />
      <Stack
        key={`ExpressionDetailsComp_${idx}_${spelling}`}
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'left',
          justifyContent: 'center',
          paddingRight: viewport.isLessThan(EBreakpoints.XXL) ? '15px' : 0,
        }}
      >
        <Typography
          variant="h2"
          className={expressionFont.className}
          fontSize={viewport.isLessThan(EBreakpoints.MD) ? '2.5rem' : '3.75rem'}
          id={spellingId}
          sx={(theme) => ({
            [theme.breakpoints.down('md')]: {
              width: '90vw',
              wordWrap: 'break-word',
              fontSize: '2.5rem',
            },
          })}
        >
          {toLowerCaseLezgi(spelling)}
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ mb: '10px' }}>
          {data.inflection}
        </Typography>
        {data.definitions.map((dd, i) => (
          <DefinitionDetailsComp
            key={`exp_det_${i}`}
            idx={i}
            definitions={dd}
            lang={websiteLang}
            spelling={spelling}
            inflection={data.inflection}
            spellingId={spellingId}
          />
        ))}
        {data.examples && data.examples.length > 0 && (
          <Typography id={createOtherExamplesId(idx)} variant="h5" sx={{ pl: '3px', mb: '10px' }}>
            ● {t('otherExamples').toLowerCase()} ({data.examples.length}):
          </Typography>
        )}
        <ExamplesComp
          parentIdx={idx}
          lang={websiteLang}
          title={t('view')}
          isOtherExamples={true}
          examples={data.examples}
        />
        <Typography variant="caption" color="text.secondary" sx={{ m: '15px 0' }}>
          {`${data.source?.name} - ${data.source?.authors}`}
        </Typography>
        {!isLast && <Divider sx={{ mt: '30px' }} />}
      </Stack>
    </Stack>
  );
};

type SpellingVariantsListProps = {
  spelling: string;
  spellingVariants: SpellingVariant[];
  websiteLang: WebsiteLang;
  wordLangDialect: LangDialect;
};

const SpellingVariantsList: FC<SpellingVariantsListProps> = ({
  spelling,
  spellingVariants,
  websiteLang,
  wordLangDialect,
}) => {
  const { t } = useTranslation(websiteLang);
  return (
    (spellingVariants.length ?? 0) > 0 && (
      <Box
        sx={(theme) => ({
          minWidth: '250px',
          // [theme.breakpoints.down('md')]: {
          // order: 2,
          width: '100%',
          ml: '0px !important',
          pt: '15px',
          boxSizing: 'border-box',
          '&.MuiBox-root': {
            ml: '0px !important',
            mt: '10px',
          },
          // },
        })}
      >
        <Typography
          variant="h6"
          sx={(theme) => ({
            // [theme.breakpoints.down('md')]: {
            pl: '15px',
            // }
          })}
        >
          {t(`wordVariants`, { ns: 'common' })}
        </Typography>
        <List
          sx={(theme) => ({
            display: 'flex',
            // flexDirection: 'column',
            // [theme.breakpoints.down('md')]: {
            flexDirection: 'row',
            p: 0,
            overflow: 'auto',
            maxWidth: '100vw',
            // },
          })}
        >
          <Divider
            sx={(theme) => ({
              // [theme.breakpoints.down('md')]: {
              display: 'none',
              // }
            })}
          />
          <ListItem
            sx={(theme) => ({
              pt: 0,
              mb: '10px',
              pl: '15px',
              pr: '15px',
              ml: 0,
              width: 'fit-content',
              // [theme.breakpoints.down('md')]: {
              borderRightWidth: '1px',
              borderRightStyle: 'solid',
              borderRightColor: '#ccc',
              // },
            })}
          >
            <ListItemText
              primary={toLowerCaseLezgi(spelling)}
              secondary={langDialectToString(wordLangDialect, t, {
                showOnlyDialect: true,
              })}
            />
          </ListItem>
          {spellingVariants.map((variant, i) => (
            <ListItem
              key={`variant_${i}`}
              sx={(theme) => ({
                pt: 0,
                mb: '10px',
                pl: '15px',
                pr: '15px',
                ml: 0,
                width: 'fit-content',
                // [theme.breakpoints.down('md')]:
                ...(i < spellingVariants.length - 1
                  ? {
                      borderRightWidth: '1px',
                      borderRightStyle: 'solid',
                      borderRightColor: '#ccc',
                    }
                  : {}),
              })}
            >
              <ListItemText
                primary={toLowerCaseLezgi(variant.spelling)}
                secondary={langDialectToString(variant.langDialect!, t, {
                  showOnlyDialect: true,
                })}
              />
            </ListItem>
          ))}
        </List>
      </Box>
    )
  );
};
