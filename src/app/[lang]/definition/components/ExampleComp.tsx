'use client';
import React, { FC } from 'react';
import { Example, WebsiteLang } from '@api/types.model';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Typography,
  // Adding '/index' helps to avoid Nextjs 14.0.4 error. See: https://github.com/mui/material-ui/issues/40214#issuecomment-1866196893
} from '@mui/material/index';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

import { useTranslation } from 'react-i18next';
import { ExamplesList } from './ExamplesList';

export const ExamplesComp: FC<{
  parentIdx: number;
  lang: WebsiteLang;
  title: string;
  isOtherExamples?: boolean;
  examples?: Example[];
}> = ({ parentIdx, lang, title, examples, isOtherExamples }) => {
  const { t } = useTranslation(lang);
  return examples && examples.length > 0 ? (
    <Accordion
      variant="outlined"
      sx={(theme) => ({
        backgroundColor: 'inherit',
        width: isOtherExamples ? 'calc(100% - 24px)' : 'unset',
        maxWidth: isOtherExamples ? '750px' : '500px',
        mr: '24px'
      })}
      TransitionProps={{ timeout: 200 }}
    >
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Typography color="text.secondary">{title}</Typography>
      </AccordionSummary>
      <AccordionDetails>
        <ExamplesList parentIdx={parentIdx} lang={lang} examples={examples} />
      </AccordionDetails>
    </Accordion>
  ) : null;
};
