import React, { FC, use } from 'react';
import { Definition, DefinitionDetails, DictionaryLang, Example, WebsiteLang } from '@/api/types';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Chip,
  Grid,
  List,
  ListItem,
  ListItemText,
  ListSubheader,
  Stack,
  Typography,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useTranslation } from '@i18n/index';
import { expressionFont } from '@/fonts';
import { createDetailsId } from '../utils';
import { ExamplesComp } from './ExampleComp';

// const idxToChar = (lang: WebsiteLang, idx: number) => {
//   return lang === 'rus' || lang === 'lez'
//     ? String.fromCharCode(1072 + idx)
//     : String.fromCharCode(97 + idx);
// };

type DefinitionCompProps = {
  idx: number;
  lang: WebsiteLang;
  key: string;
  definition: Definition;
};

const DefinitionComp: FC<DefinitionCompProps> = async ({ idx, lang, key, definition }) => {
  const { t } = await useTranslation(lang);
  const { t: tTags } = await useTranslation(lang, 'tags');
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
          {definition.value}
        </Typography>
      </Stack>
      <Stack direction="row" spacing={2}>
        {definition.tags?.map((tag, t_i) => (
          <Chip
            key={`exp_det_${key}_tags_${tag}_${t_i}`}
            sx={{ maxWidth: '250px', width: 'wrap-content' }}
            label={tTags(tag)}
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
}> = async ({ idx, lang, definitions, examples, spelling, inflection }) => {
  const { t } = await useTranslation(lang);
  return (
    <Grid container spacing={2} sx={{ pb: '25px', pl: '25px' }}>
      <Grid item xs={12}>
        <Stack
          id={createDetailsId(idx, spelling, definitions.length, inflection, examples?.length)}
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
      <Grid item xs={12}>
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
