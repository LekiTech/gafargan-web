'use client';
import React, { FC } from 'react';
import { WebsiteLang } from '@api/types.model';
import {
  Box,
  Collapse,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Stack,
  Typography,
  // Adding '/index' helps to avoid Nextjs 14.0.4 error. See: https://github.com/mui/material-ui/issues/40214#issuecomment-1866196893
} from '@mui/material/index';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
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
    <List sx={{ width: '100%' }} disablePadding>
      {examples.flatMap((ex, i) => {
        if (ex.example.src && ex.example.trl) {
          return [
            <Divider key={`${ex.id}_divider_${i}`} component="li" sx={{ mt: '5px' }} />,
            <ListItem key={`${ex.id}_item_${i}`} sx={{ pt: 0 }}>
              <Stack direction="column">
                <SpellingListItem
                  key={`${ex.id}_spelling_${i}`}
                  id={ex.id}
                  spelling={ex.spelling}
                  fromLang={ex.example.srcLangId}
                  toLang={ex.example.trlLangId}
                  sx={{ ml: 0, pl: 0 }}
                />
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
          <Divider key={`${ex.id}_divider_${i}`} component="li" sx={{ mt: '5px' }} />,
          <ListItem key={`${ex.id}_item_${i}`} sx={{ pt: 0 }}>
            <Stack direction="column">
              <SpellingListItem
                key={`${ex.id}_spelling_${i}`}
                id={ex.id}
                spelling={ex.spelling}
                fromLang={ex.example.srcLangId}
                toLang={ex.example.trlLangId}
                sx={{ ml: 0, pl: 0 }}
              />
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

export const FoundExamplesListMobile: FC<{
  lang: WebsiteLang;
  examples?: ExpressionExampleResponseDto[];
}> = ({ lang, examples }) => {
  const [open, setOpen] = React.useState(false);

  const handleClick = () => {
    setOpen(!open);
  };
  return (
    <Collapse in={open} timeout="auto" collapsedSize={'150px'} orientation='vertical' sx={{ position: 'relative' }}>
      <FoundExamplesList lang={lang} examples={examples} />
      {!open && (
        <Box sx={{
          position: 'absolute',
          top: 0,
          height: '150px',
          width: '100%',
          backgroundImage: 'linear-gradient(to bottom, rgba(255,255,255,0), rgba(255,255,255,1) 80% 100%)'
        }} />
      )}
      <IconButton
        aria-label="expand"
        onClick={handleClick}
        size="small"
        sx={{ position: 'absolute', bottom: '0px', left: '47%', display: 'block', margin: 'auto' }}
      >
        {open ? <ExpandLess /> : <ExpandMore />}
      </IconButton>
    </Collapse>
  );
};