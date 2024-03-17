'use client';
import React, { FC } from 'react';
import { Example, WebsiteLang } from '@api/types.model';
import {
  Divider,
  List,
  ListItem,
  ListItemText,
  Stack,
  // Adding '/index' helps to avoid Nextjs 14.0.4 error. See: https://github.com/mui/material-ui/issues/40214#issuecomment-1866196893
} from '@mui/material/index';
import { ParsedTextComp } from '../../components/ParsedTextComp';

import { TagComp } from './TagComp';
import { useTranslation } from 'react-i18next';

export const ExamplesList: FC<{
  parentIdx: number;
  lang: WebsiteLang;
  examples?: Example[];
}> = ({ parentIdx, lang, examples }) => {
  const { t } = useTranslation(lang);
  return examples && examples.length > 0 ? (
    <List sx={{ width: '100%' }}>
      {examples.flatMap((ex, i) => {
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
        return [
          <Divider key={`divider_${parentIdx}_${i}`} component="li" />,
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
          </ListItem>,
        ];
      })}
    </List>
  ) : null;
};
