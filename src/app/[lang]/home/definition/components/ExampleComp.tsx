'use client';
import React, { FC, useMemo } from 'react';
import { Example, WebsiteLang } from '@api/types.model';
import { Accordion, AccordionDetails, AccordionSummary, Typography } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

import { useTranslation } from 'react-i18next';
import { ExamplesList } from './ExamplesList';
import { useViewport } from '../../../../use/useViewport';
import { EBreakpoints } from '../../../../utils/BreakPoints';
import { Translation } from '@repository/entities/Translation';

export const ExamplesComp: FC<{
  parentIdx: number;
  lang: WebsiteLang;
  title: string;
  isOtherExamples?: boolean;
  examples?: Translation[];
}> = ({ parentIdx, lang, title, examples, isOtherExamples }) => {
  const { t } = useTranslation(lang);
  const { viewport } = useViewport();

  const accordionWidth = useMemo(() => {
    return isOtherExamples || viewport.isLessThan(EBreakpoints.XXL) ? '100%' : '500px';
  }, [isOtherExamples, viewport]);

  return examples && examples.length > 0 ? (
    <Accordion
      variant="outlined"
      sx={(theme) => ({
        backgroundColor: 'inherit',
        // width: isOtherExamples ? 'calc(100% - 24px)' : 'unset',
        width: accordionWidth,
        maxWidth: isOtherExamples ? '750px' : '500px',
        mr: '24px',
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
