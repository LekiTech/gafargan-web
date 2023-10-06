import React, { FC, use } from 'react';
import expressionApi from '@/api/expression';
import { ExpressionDetails, WebsiteLang } from '@/api/types';
import { Box, Chip, Divider, Stack, Typography } from '@mui/material';
import { useTranslation } from '@i18n/index';
import { expressionFont, lusitanaFont } from '@/fonts';
import { DefinitionDetailsComp } from './DefinitionComp';
import { createOtherExamplesId, createSpellingId } from '../utils';
import { ExamplesComp } from './ExampleComp';

function expressionSpellingToLowerCase(spelling: string) {
  return spelling.toLowerCase().replaceAll('i', 'I');
}
type ExpressionDetailsCompProps = {
  idx: number;
  lang: WebsiteLang;
  spelling: string;
  data: ExpressionDetails;
  isLast: boolean;
};

const ExpressionDetailsComp: FC<ExpressionDetailsCompProps> = async ({
  idx,
  lang,
  spelling,
  data,
  isLast,
}) => {
  const { t } = await useTranslation(lang);
  // const { t: tTags } = await useTranslation(lang, 'tags');
  return (
    <Stack
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'left',
        justifyContent: 'center',
      }}
    >
      <Typography
        variant="h2"
        className={expressionFont.className}
        id={createSpellingId(idx, spelling, data.definitionDetails.length, data.inflection)}
      >
        {expressionSpellingToLowerCase(spelling)}
      </Typography>
      <Typography variant="h6" color="text.secondary" sx={{ mb: '50px' }}>
        {data.inflection}
      </Typography>

      {data.definitionDetails.map((dd, i) => (
        <DefinitionDetailsComp
          key={`exp_det_${i}`}
          idx={i}
          definitionDetails={dd}
          lang={lang}
          spelling={spelling}
          inflection={data.inflection}
        />
      ))}
      <Typography id={createOtherExamplesId(idx)} variant="h5" sx={{ pl: '3px', mb: '10px' }}>
        ● {t('otherExamples').toLowerCase()} ({data.examples?.length ?? 0}):
      </Typography>
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

export default ExpressionDetailsComp;
