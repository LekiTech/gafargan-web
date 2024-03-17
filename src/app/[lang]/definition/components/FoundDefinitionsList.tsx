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
import { ExpressionDefinitionResponseDto } from '@api/types.dto';
import { SpellingListItem } from './SpellingListItem';

export const FoundDefinitionsList: FC<{
  lang: WebsiteLang;
  definitions?: ExpressionDefinitionResponseDto[];
}> = ({ lang, definitions }) => {
  const { t } = useTranslation(lang);
  const searchParams = useSearchParams();
  const searchString = searchParams.get('exp') ?? undefined;
  return definitions && definitions.length > 0 ? (
    <List sx={{ width: '100%' }}>
      {definitions.flatMap((def, i) => {
        return [
          <Divider key={`${def.id}_divider_${i}`} component="li" sx={{ mt: '10px' }} />,
          <SpellingListItem
            key={`${def.id}_spelling_${i}`}
            id={def.id}
            spelling={def.spelling}
            fromLang={def.expLangId}
            toLang={def.definition.defLangId}
          />,
          <ListItem key={`${def.id}_item_${i}`} sx={{ pt: 0 }}>
            <Stack direction="column">
              <ListItemText
                primary={
                  <ParsedTextComp
                    text={def.definition.value}
                    highlightOptions={{ stringToHighlight: searchString }}
                  />
                }
              />
              {def.definition.tags && def.definition.tags.length > 0 && (
                <Stack direction="row" spacing={2} sx={{ mt: '10px !important' }}>
                  {def.definition.tags.map((tag, t_i) => (
                    <TagComp
                      key={`${def.id}_definition_${i}_tags_${tag}_${t_i}`}
                      label={t(tag, { ns: 'tags' })}
                    />
                  ))}
                </Stack>
              )}
              <Typography variant="caption" color="text.secondary" sx={{ mt: '10px' }}>
                {t(`languages.${def.expLangId}`, { ns: 'common' })} →{' '}
                {t(`languages.${def.definition.defLangId}`, { ns: 'common' })}
              </Typography>
            </Stack>
          </ListItem>,
        ];
      })}
    </List>
  ) : null;
};
