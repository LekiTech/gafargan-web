import React, { FC } from 'react';
import { Example, WebsiteLang } from '@/api/types';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  List,
  ListItem,
  ListItemText,
  Typography,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { createOtherExamplesId } from '../utils';
// import { useTranslation } from '@i18n/index';

export const ExamplesComp: FC<{
  parentIdx: number;
  lang: WebsiteLang;
  title: string;
  includeId?: boolean;
  examples?: Example[];
}> = async ({ parentIdx, title, examples, includeId }) => {
  // const { t } = await useTranslation(lang);
  return examples && examples.length > 0 ? (
    <Accordion
      id={includeId ? createOtherExamplesId(parentIdx) : undefined}
      variant="outlined"
      sx={{ backgroundColor: 'inherit', width: includeId ? '100%' : '500px' }}
    >
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Typography color="text.secondary">{title}</Typography>
      </AccordionSummary>
      <AccordionDetails>
        <List sx={{ width: '100%' }}>
          {examples?.map((ex, i) => {
            if (ex.src && ex.trl) {
              return (
                <ListItem key={`${parentIdx}_${i}`}>
                  <ListItemText primary={ex.src} secondary={ex.trl} />
                </ListItem>
              );
            }
            return (
              <ListItem key={`${parentIdx}_${i}`}>
                <ListItemText primary={ex.raw} />
              </ListItem>
            );
          })}
        </List>
      </AccordionDetails>
    </Accordion>
  ) : null;
};
