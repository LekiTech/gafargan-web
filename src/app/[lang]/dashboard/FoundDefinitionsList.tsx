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
} from '@mui/material';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import { ParsedTextComp } from '../components/ParsedTextComp';
import { TagComp } from '../components/TagComp';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'next/navigation';
import { ExpressionDefinitionResponseDto } from '@api/types.dto';
import { SpellingListItem } from '../components/SpellingListItem';
import { FoundDefinition } from '@repository/types.model';
import { IdToLang } from '@api/languages';
import { Word } from '@repository/entities/Word';

export const FoundDefinitionsList: FC<{
  lang: WebsiteLang;
  words: Word[];
}> = ({ lang, words }) => {
  const { t } = useTranslation(lang);
  const searchParams = useSearchParams();
  const searchString = searchParams.get('exp') ?? undefined;
  return words && words.length > 0 ? (
    <List sx={{ width: '100%' }} disablePadding>
      {words.flatMap((word, i) => {
        return [
          <Divider key={`${word.id}_divider_${i}`} component="li" sx={{ mt: '5px' }} />,
          <ListItem key={`${word.id}_item_${i}`} sx={{ pt: 0, minHeight: '125px' }}>
            <Stack direction="column">
              <SpellingListItem
                key={`${word.id}_spelling_${i}`}
                id={word.id}
                spelling={word.spelling}
                fromLang={IdToLang[word.langDialect.id]}
                // toLang={IdToLang[word.definitions_lang_dialect_id]}
                sx={{ ml: 0, pl: 0 }}
              />
              {word.details.map((wordDetail) => (
                <Box key={`${word.id}_${wordDetail.id}`}>
                  <ListItemText
                    primary={
                      <Stack direction="row" spacing={2} sx={{ mt: '10px !important' }}>
                        {wordDetail?.definitions[0]?.values[0]?.tags &&
                          wordDetail?.definitions[0]?.values[0]?.tags.length > 0 &&
                          wordDetail?.definitions[0]?.values[0]?.tags.map((tag, t_i) => (
                            <TagComp
                              key={`${word.id}_definition_${i}_tags_${tag}_${t_i}`}
                              label={t(tag, { ns: 'tags' })}
                            />
                          ))}
                        <ParsedTextComp
                          text={wordDetail?.definitions[0]?.values[0].value ?? ''}
                          highlightOptions={{ stringToHighlight: searchString }}
                        />
                      </Stack>
                    }
                  />
                  <Typography variant="caption" color="text.secondary" sx={{ mt: '10px' }}>
                    {/* {t(`languages.${IdToLang[word.langDialect.id]}`, { ns: 'common' })} →{' '}
                  {t(`languages.${IdToLang[wordDetail?.langDialect.id]}`, { ns: 'common' })} */}
                    {wordDetail?.source?.name} - {wordDetail?.source?.authors}
                  </Typography>
                </Box>
              ))}
            </Stack>
          </ListItem>,
        ];
      })}
    </List>
  ) : null;
};

// export const FoundDefinitionsListMobile: FC<{
//   lang: WebsiteLang;
//   definitions?: FoundDefinition[];
// }> = ({ lang, definitions }) => {
//   const [open, setOpen] = React.useState(false);

//   const handleClick = () => {
//     setOpen(!open);
//   };
//   return (
//     <Collapse
//       in={open}
//       timeout="auto"
//       collapsedSize={'150px'}
//       orientation="vertical"
//       sx={{ position: 'relative' }}
//     >
//       <FoundDefinitionsList lang={lang} definitions={definitions} />
//       {!open && (
//         <Box
//           sx={{
//             position: 'absolute',
//             top: 0,
//             height: '150px',
//             width: '100%',
//             backgroundImage:
//               'linear-gradient(to bottom, rgba(255,255,255,0), rgba(255,255,255,1) 80% 100%)',
//           }}
//         />
//       )}
//       <IconButton
//         aria-label="expand"
//         onClick={handleClick}
//         size="small"
//         sx={{ position: 'absolute', bottom: '0px', left: '47%', display: 'block', margin: 'auto' }}
//       >
//         {open ? <ExpandLess /> : <ExpandMore />}
//       </IconButton>
//     </Collapse>
//   );
// };
