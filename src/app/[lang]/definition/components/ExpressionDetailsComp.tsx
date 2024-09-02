'use client';
import React, { FC } from 'react';
import { ExpressionDetails, WebsiteLang } from '../../../../api/types.model';
// Adding '/index' helps to avoid Nextjs 14.0.4 error. See: https://github.com/mui/material-ui/issues/40214#issuecomment-1866196893
import { Divider, Stack, Typography } from '@mui/material/index';
import { expressionFont } from '@/fonts';
import { DefinitionDetailsComp } from './DefinitionComp';
import { createOtherExamplesId, createSpellingId } from '../utils';
import { ExamplesComp } from './ExampleComp';
import { useTranslation } from 'react-i18next';
import { toLowerCaseLezgi } from '../../../utils';
import { useViewport } from '../../../use/useViewport';
import { EBreakpoints } from '../../../utils/BreakPoints';

type ExpressionDetailsCompProps = {
  idx: number;
  lang: WebsiteLang;
  spelling: string;
  data: ExpressionDetails;
  isLast: boolean;
};

export const ExpressionDetailsComp: FC<ExpressionDetailsCompProps> = ({
  idx,
  lang,
  spelling,
  data,
  isLast,
}) => {
  const { t } = useTranslation(lang);
  // const { t: tTags } = await useTranslation(lang, 'tags');
  const spellingId = createSpellingId(idx, spelling, data.definitionDetails.length, data.inflection)

  const { viewport } = useViewport();
  return (
    <Stack
      key={`ExpressionDetailsComp_${idx}_${spelling}`}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'left',
        justifyContent: 'center',
        padding: viewport.isLessThan(EBreakpoints.XXL) ? '0 10px' : 0
      }}
    >
      <Typography
        variant="h2"
        className={expressionFont.className}
        fontSize={viewport.isLessThan(EBreakpoints.MD) ? '2.5rem' : '3.75rem'}
        id={spellingId}
      >
        {toLowerCaseLezgi(spelling)}
      </Typography>
      <Typography variant="h6" color="text.secondary">
        {data.inflection}
      </Typography>
      <Typography variant="caption" color="text.secondary" sx={{ m: '25px 0' }}>
        {`${data.writtenSources[0].title} - ${data.writtenSources[0].authors}`}
      </Typography>
      {data.definitionDetails.map((dd, i) => (
        <DefinitionDetailsComp
          key={`exp_det_${i}`}
          idx={i}
          definitionDetails={dd}
          lang={lang}
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
        lang={lang}
        title={t('view')}
        isOtherExamples={true}
        examples={data.examples}
      />
      {!isLast && <Divider sx={{ mt: '30px' }} />}
    </Stack>
  );
};
