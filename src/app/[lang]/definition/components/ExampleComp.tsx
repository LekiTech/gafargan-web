'use client';
import React, { FC } from 'react';
import { Example, WebsiteLang } from '@api/types.model';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemText,
  Stack,
  Typography,
  // Adding '/index' helps to avoid Nextjs 14.0.4 error. See: https://github.com/mui/material-ui/issues/40214#issuecomment-1866196893
} from '@mui/material/index';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { ParsedTextComp } from '../../components/ParsedTextComp';

import { TagComp } from './TagComp';
import { useTranslation } from 'react-i18next';

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
      sx={{ backgroundColor: 'inherit', width: isOtherExamples ? '100%' : '500px' }}
      TransitionProps={{ timeout: 200 }}
    >
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Typography color="text.secondary">{title}</Typography>
      </AccordionSummary>
      <AccordionDetails>
        <List sx={{ width: '100%' }}>
          {examples?.flatMap((ex, i) => {
            if (ex.src && ex.trl) {
              return [
                <Divider key={`divider_${parentIdx}_${i}`} component="li" />,
                <ListItem key={`${parentIdx}_${i}`}>
                  <Stack direction="column">
                    <ListItemText
                      primary={<ParsedTextComp text={ex.src} />}
                      secondary={<ParsedTextComp text={ex.trl} />}
                      // primary={ex.src}
                      // secondary={ex.trl}
                    />
                    {ex.tags && ex.tags.length > 0 && (
                      <Stack direction="row" spacing={2}>
                        {ex.tags.map((tag, t_i) => (
                          <TagComp
                            key={`example_${parentIdx}_${i}_tags_${tag}_${t_i}`}
                            label={t(tag, { ns: 'tags' })}
                            // size="small"
                            // sx={{ maxWidth: '250px', fontSize: '12px', width: 'wrap-content' }}
                          />
                        ))}
                      </Stack>
                    )}
                  </Stack>
                </ListItem>,
              ];
            }
            return (
              <>
                <Divider component="li" />
                <ListItem key={`${parentIdx}_${i}`}>
                  <Stack direction="column">
                    <ListItemText primary={<ParsedTextComp text={ex.raw} />} />
                    {ex.tags && ex.tags.length > 0 && (
                      <Stack direction="row" spacing={2}>
                        {ex.tags.map((tag, t_i) => (
                          <TagComp
                            key={`example_${parentIdx}_${i}_tags_${tag}_${t_i}`}
                            label={t(tag, { ns: 'tags' })}
                            // size="small"
                            // sx={{ maxWidth: '250px', width: 'wrap-content' }}
                          />
                        ))}
                      </Stack>
                    )}
                  </Stack>
                </ListItem>
              </>
            );
          })}
        </List>
      </AccordionDetails>
    </Accordion>
  ) : null;
};
