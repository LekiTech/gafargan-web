import React, { FC, use } from 'react';
import { Definition, DefinitionDetails, DictionaryLang, Example, WebsiteLang } from '@/api/types';
import { Chip, Stack, Typography } from '@mui/material';
import { useTranslation } from '@i18n/index';
import { expressionFont } from '@/fonts';
import { createDetailsId } from '../utils';

const idxToChar = (lang: WebsiteLang, idx: number) => {
  return lang === 'rus' || lang === 'lez'
    ? String.fromCharCode(1072 + idx)
    : String.fromCharCode(97 + idx);
};

type DefinitionCompProps = {
  idx: number;
  lang: WebsiteLang;
  key: string;
  definition: Definition;
};

const DefinitionComp: FC<DefinitionCompProps> = async ({ idx, lang, key, definition }) => {
  const { t } = await useTranslation(lang, 'tags');
  return (
    <Stack
      spacing={2}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'left',
        justifyContent: 'center',
        // pt: '25px',
        pl: '25px',
        // borderLeft: '1px solid grey',
      }}
    >
      <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
        <Typography variant="body1" sx={{ fontWeight: 'bold', fontSize: '16px', minWidth: '20px' }}>
          {idxToChar(lang, idx) + ' :'}
        </Typography>
        <Typography variant="body1" sx={{ fontSize: '20px' }}>
          {definition.value}
        </Typography>
      </Stack>
      <Stack direction="row" spacing={2}>
        {definition.tags?.map((tag, t_i) => (
          <Chip
            key={`exp_det_${key}_tags_${tag}_${t_i}`}
            sx={{ maxWidth: '250px', width: 'wrap-content' }}
            label={t(tag)}
          />
        ))}
      </Stack>
    </Stack>
  );
};

const DefinitionsGroup: FC<{
  idx: number;
  lang: WebsiteLang;
  definitions: Definition[];
  examples?: Example[];
  tags?: string[];
  spelling: string;
  inflection?: string;
}> = ({ idx, lang, definitions, examples, spelling, inflection }) => {
  return (
    <Stack
      id={createDetailsId(idx, spelling, definitions.length, inflection, examples?.length)}
      spacing={0}
      sx={{ pb: '25px' }}
    >
      {definitions.map((d, i) => (
        <DefinitionComp key={`${idx}_${i}`} idx={i} definition={d} lang={lang} />
      ))}
    </Stack>
  );
};

export const DefinitionDetailsComp: FC<{
  idx: number;
  definitionDetails: DefinitionDetails;
  lang: WebsiteLang;
  spelling: string;
  inflection?: string;
}> = ({ idx, definitionDetails, lang, spelling, inflection }) => {
  return (
    <Stack direction="row" key={`exp_det_${idx}`} sx={{ position: 'relative' }}>
      <Typography
        variant="body1"
        sx={{ fontWeight: 'bold', fontSize: '20px', width: '20px', textAlign: 'end' }}
      >
        {idx + 1}
      </Typography>
      <DefinitionsGroup
        idx={idx}
        lang={lang}
        definitions={definitionDetails.definitions}
        examples={definitionDetails.examples}
        tags={definitionDetails.tags}
        spelling={spelling}
        inflection={inflection}
      />
    </Stack>
  );
};
