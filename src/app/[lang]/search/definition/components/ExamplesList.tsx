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
} from '@mui/material';
import { ParsedTextComp } from '../../../components/ParsedTextComp';

import { TagComp } from '../../../components/TagComp';
import { useTranslation } from 'react-i18next';
import { Translation } from '@repository/entities/Translation';
import { useSearchParams } from 'next/navigation';
import { LangToId } from '@api/languages';

export const ExamplesList: FC<{
  parentIdx: number;
  lang: WebsiteLang;
  examples?: Translation[];
}> = ({ parentIdx, lang, examples }) => {
  const { t } = useTranslation(lang);
  const searchParams = useSearchParams();
  const fromLang = searchParams.get('fromLang') ?? undefined;
  const toLang = searchParams.get('toLang') ?? undefined;
  if (fromLang == undefined || toLang == undefined) {
    return undefined;
  }
  return examples && examples.length > 0 ? (
    <List sx={{ width: '100%' }}>
      {examples.flatMap((ex, i) => {
        // const srcExample = ex.phrasesPerLangDialect[LangToId[fromLang]];
        // const trgExample = ex.phrasesPerLangDialect[LangToId[toLang]];
        const srcExamples = LangToId[fromLang]
          .map((langId) => ex.phrasesPerLangDialect[langId])
          .filter((p) => p);
        const trgExamples = LangToId[toLang]
          .map((langId) => ex.phrasesPerLangDialect[langId])
          .filter((p) => p);

        if (ex.phrasesPerLangDialect && srcExamples && trgExamples) {
          return [
            <Divider key={`divider_${parentIdx}_${i}`} component="li" />,
            <ListItem key={`${parentIdx}_${i}`}>
              <Stack direction="column">
                <ListItemText
                  primary={
                    <span style={{ display: 'flex', flexDirection: 'column' }}>
                      {/* TODO: show tags */}
                      {srcExamples.map((srcExample, i) => (
                        <ParsedTextComp key={srcExample.phrase + i} text={srcExample.phrase} />
                      ))}
                    </span>
                  }
                  secondary={
                    <span style={{ display: 'flex', flexDirection: 'column' }}>
                      {/* TODO: show tags */}
                      {trgExamples.map((trgExample, i) => (
                        <ParsedTextComp key={trgExample.phrase + i} text={trgExample.phrase} />
                      ))}
                    </span>
                  }
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
        if (ex.raw) {
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
        }
        return undefined;
      })}
    </List>
  ) : null;
};
