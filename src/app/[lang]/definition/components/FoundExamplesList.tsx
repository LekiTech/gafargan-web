'use client';
import React, { FC } from 'react';
import { WebsiteLang } from '@api/types.model';
import {
  Divider,
  List,
  ListItem,
  ListItemText,
  Stack,
  Typography,
  // Adding '/index' helps to avoid Nextjs 14.0.4 error. See: https://github.com/mui/material-ui/issues/40214#issuecomment-1866196893
} from '@mui/material/index';
import { ParsedTextComp } from '../../components/ParsedTextComp';

import { TagComp } from './TagComp';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'next/navigation';
import { ExpressionExampleResponseDto } from '@api/types.dto';
import { SpellingListItem } from './SpellingListItem';

// This is a default highlight style of <mark> tag. If needed, it can be changed and applied to all of the ParsedTextComp components.
const highlightStyles = { color: 'black', backgroundColor: 'yellow' };

export const FoundExamplesList: FC<{
  lang: WebsiteLang;
  examples?: ExpressionExampleResponseDto[];
}> = ({ lang, examples }) => {
  const { t } = useTranslation(lang);
  const searchParams = useSearchParams();
  const searchString = searchParams.get('exp') ?? undefined;
  return examples && examples.length > 0 ? (
    <List sx={{ width: '100%' }}>
      {examples.flatMap((ex, i) => {
        const topItems = [
          <Divider key={`${ex.id}_divider_${i}`} component="li" sx={{ mt: '5px' }} />,
          <SpellingListItem
            key={`${ex.id}_spelling_${i}`}
            id={ex.id}
            spelling={ex.spelling}
            fromLang={ex.example.srcLangId}
            toLang={ex.example.trlLangId}
          />,
        ];
        if (ex.example.src && ex.example.trl) {
          return [
            ...topItems,
            <ListItem key={`${ex.id}_item_${i}`} sx={{ pt: 0 }}>
              <Stack direction="column">
                <ListItemText
                  primary={
                    <ParsedTextComp
                      text={ex.example.src}
                      highlightOptions={{ stringToHighlight: searchString }}
                    />
                  }
                  secondary={
                    <ParsedTextComp
                      text={ex.example.trl}
                      highlightOptions={{ stringToHighlight: searchString }}
                    />
                  }
                />
                {ex.example.tags && ex.example.tags.length > 0 && (
                  <Stack direction="row" spacing={2} sx={{ mt: '10px !important' }}>
                    {ex.example.tags.map((tag, t_i) => (
                      <TagComp
                        key={`${ex.id}_example_${i}_tags_${tag}_${t_i}`}
                        label={t(tag, { ns: 'tags' })}
                      />
                    ))}
                  </Stack>
                )}
                <Typography variant="caption" color="text.secondary" sx={{ mt: '10px' }}>
                  {t(`languages.${ex.example.srcLangId}`, { ns: 'common' })} →{' '}
                  {t(`languages.${ex.example.trlLangId}`, { ns: 'common' })}
                </Typography>
              </Stack>
            </ListItem>,
          ];
        }
        return [
          ...topItems,
          <ListItem key={`${ex.id}_item_${i}`} sx={{ pt: 0 }}>
            <Stack direction="column">
              <ListItemText
                primary={
                  <ParsedTextComp
                    text={ex.example.raw}
                    highlightOptions={{ stringToHighlight: searchString }}
                  />
                }
              />
              {ex.example.tags && ex.example.tags.length > 0 && (
                <Stack direction="row" spacing={2} sx={{ mt: '10px !important' }}>
                  {ex.example.tags.map((tag, t_i) => (
                    <TagComp
                      key={`${ex.id}_example_${i}_tags_${tag}_${t_i}`}
                      label={t(tag, { ns: 'tags' })}
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
