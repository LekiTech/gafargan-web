'use client';
import React, { FC } from 'react';
import { WebsiteLang } from '../../../../../api/types.model';
import { Divider, Stack, Typography } from '@mui/material';
import { expressionFont } from '@/fonts';
import { DefinitionDetailsComp } from './DefinitionComp';
import { createOtherExamplesId, createSpellingId } from '../utils';
import { ExamplesComp } from './ExampleComp';
import { useTranslation } from 'react-i18next';
import { toLowerCaseLezgi } from '../../../../utils';
import { useViewport } from '../../../../use/useViewport';
import { EBreakpoints } from '../../../../utils/BreakPoints';
import { WordDetail } from '@repository/entities/WordDetail';
import { SpellingVariant } from '@repository/entities/SpellingVariant';
import { LangDialect } from '@repository/entities/LangDialect';
import { SpellingVariantsList } from './SpellingVariantsList';

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
        isRow={true}
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
