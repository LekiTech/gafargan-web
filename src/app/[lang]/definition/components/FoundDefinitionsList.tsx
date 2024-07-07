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
          <ListItem key={`${def.id}_item_${i}`} sx={{ pt: 0 }}>
            <Stack direction="column">
              <SpellingListItem
                key={`${def.id}_spelling_${i}`}
                id={def.id}
                spelling={def.spelling}
                fromLang={def.expLangId}
                toLang={def.definition.defLangId}
                sx={{ ml: 0, pl: 0 }}
              />
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

export const FoundDefinitionsListMobile: FC<{
  lang: WebsiteLang;
  definitions?: ExpressionDefinitionResponseDto[];
}> = ({ lang, definitions }) => {
  const [open, setOpen] = React.useState(false);

  const handleClick = () => {
    setOpen(!open);
  };
  return (
    <Collapse in={open} timeout="auto" collapsedSize={'150px'} orientation='vertical' sx={{ position: 'relative' }}>
      <FoundDefinitionsList lang={lang} definitions={definitions} />
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
  )
};