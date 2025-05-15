'use client';
import React, { FC, useEffect, useState } from 'react';
import { WebsiteLang, DefinitionDetails, Example } from '@api/types.model';
// Adding '/index' helps to avoid Nextjs 14.0.4 error. See: https://github.com/mui/material-ui/issues/40214#issuecomment-1866196893
import { Box, Grid, Stack, Typography } from '@mui/material';
// import { getTranslation } from '@i18n/index';
import { createDetailsId } from '../utils';
import { ExamplesComp } from './ExampleComp';
import { ParsedTextComp } from '../../../components/ParsedTextComp';
import { colors } from '@/colors';
import { TagComp } from '../../../components/TagComp';
import { TFunction } from 'i18next';
import { useTranslation } from 'react-i18next';
import { Definition, DefinitionValue } from '@repository/entities/Definition';
import { Translation } from '@repository/entities/Translation';

// const idxToChar = (lang: WebsiteLang, idx: number) => {
//   return lang === 'rus' || lang === 'lez'
//     ? String.fromCharCode(1072 + idx)
//     : String.fromCharCode(97 + idx);
// };

type DefinitionCompProps = {
  idx: number;
  lang: WebsiteLang;
  // key: string;
  definition: DefinitionValue;
};

const DefinitionComp: FC<DefinitionCompProps> = ({ idx, lang, definition }) => {
  const { t } = useTranslation();
  return (
    <Stack
      spacing={2}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'left',
        justifyContent: 'center',
        // pt: '25px',
        // pl: '25px',
        // borderLeft: '1px solid grey',
      }}
    >
      <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
        <Typography variant="body1" sx={{ fontWeight: 'bold', fontSize: '16px', minWidth: '20px' }}>
          {/* {idxToChar(lang, idx) + ' :'} */}
          {t(`alphabet.${idx}`) + ' :'}
        </Typography>
        <Typography variant="body1" sx={{ fontSize: '20px' }}>
          <ParsedTextComp text={definition.value} />
        </Typography>
      </Stack>
      <Stack direction="row" spacing={2}>
        {definition.tags?.map((tag, t_i) => (
          <TagComp
            key={`exp_det_${idx}_tags_${tag}_${t_i}`}
            label={t(tag, { ns: 'tags' })}
            // sx={{ maxWidth: '250px', width: 'wrap-content' }}
          />
        ))}
      </Stack>
    </Stack>
  );
};

const DefinitionsGroup: FC<{
  idx: number;
  lang: WebsiteLang;
  definitions: DefinitionValue[];
  examples?: Translation[];
  tags?: string[];
  spelling: string;
  inflection?: string | null;
  spellingId: string;
}> = ({ idx, lang, definitions, examples, spelling, inflection, spellingId }) => {
  const { t } = useTranslation();
  // const { t } = useTranslation(lang, { useSuspense: false });
  // const [t, setT] = useState<TFunction<any, any>>();
  // useEffect(() => {
  //   getTranslation(lang).then(({ t }) => {
  //     setT(t);
  //   });
  // });
  // if (!t) {
  //   return <div>translations loading...</div>;
  // }
  return (
    <Grid container spacing={2} sx={{ pb: '25px', pl: '25px' }}>
      <Grid size={{ xs: 12 }}>
        <Stack
          id={createDetailsId(
            idx,
            spelling,
            definitions.length,
            spellingId,
            inflection,
            examples?.length,
          )}
          spacing={0}
          sx={{ width: '100%' }}
        >
          {definitions.map((d, i) => (
            <DefinitionComp key={`${idx}_${i}`} idx={i} definition={d} lang={lang} />
          ))}
          {/* {examples?.map((e, i) => (
        <Stack key={`exp_det_${idx}_ex_${i}`} spacing={2} direction={'row'}>
          <Typography variant="body1" sx={{ fontSize: '20px' }}>
            {e.src}
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ fontSize: '20px' }}>
            {e.trl}
          </Typography>
        </Stack>
      ))} */}
        </Stack>
      </Grid>
      <Grid size={{ xs: 12 }}>
        <ExamplesComp parentIdx={idx} lang={lang} title={t('examples')} examples={examples} />
        {/* {examples && examples.length > 0 && (
          <Accordion variant="outlined" sx={{ backgroundColor: 'inherit', width: '500px' }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography color="text.secondary">{t('examples')}</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <List sx={{ width: '100%' }}>
                {examples?.map((ex, i) => (
                  <ListItem key={`${idx}_${i}`}>
                    <ListItemText primary={ex.src} secondary={ex.trl} />
                  </ListItem>
                ))}
              </List>
            </AccordionDetails>
          </Accordion>
        )} */}
      </Grid>
    </Grid>
  );
};

export const DefinitionDetailsComp: FC<{
  idx: number;
  definitions: Definition;
  lang: WebsiteLang;
  spelling: string;
  inflection?: string | null;
  spellingId: string;
}> = ({ idx, definitions, lang, spelling, inflection, spellingId }) => {
  return (
    <Stack direction="row" key={`exp_det_${idx}`} sx={{ position: 'relative' }}>
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Typography
          variant="body1"
          sx={{
            fontWeight: 'bold',
            fontSize: '20px',
            width: '20px',
            textAlign: 'center',
          }}
        >
          {idx + 1}
        </Typography>
        <Box
          sx={{ flex: 2, width: '4px', backgroundColor: colors.primaryTint, opacity: 0.03 }}
        ></Box>
      </Box>
      <DefinitionsGroup
        idx={idx}
        lang={lang}
        definitions={definitions.values}
        examples={definitions.examples}
        tags={definitions.tags}
        spelling={spelling}
        inflection={inflection}
        spellingId={spellingId}
      />
    </Stack>
  );
};
