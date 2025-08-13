'use client';
import React, { FC } from 'react';
import { WebsiteLang } from '@api/types.model';
import {
  Box,
  Chip,
  Collapse,
  Divider,
  IconButton,
  Link,
  List,
  ListItem,
  ListItemText,
  Stack,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import { ParsedTextComp } from '../../../components/ParsedTextComp';
import { TagComp } from '../../../components/TagComp';
import { useTranslation } from 'react-i18next';
import { SpellingListItem } from '../../../components/SpellingListItem';
import { Word } from '@repository/entities/Word';
import { TFunction } from 'i18next';
import { expressionFont } from '@/fonts';
import { buildSpellingRegex, capitalizeFirstLetter, langDialectToString } from '../utils';
import { toLowerCaseLezgi } from '../../../../utils';
import { IdToLang, LangToId } from '@api/languages';
import { usePathname, useSearchParams } from 'next/navigation';
import { SpellingVariantsList } from './SpellingVariantsList';
import { SpellingVariant } from '@repository/entities/SpellingVariant';

export const FoundWordsList: FC<{
  lang: WebsiteLang;
  words: Word[];
}> = ({ lang, words }) => {
  const { t } = useTranslation(lang);
  return (
    <List sx={{ width: '100%' }} disablePadding>
      {words.map((word, i) => {
        return [
          i > 0 ? (
            <Divider key={`${word.id}_divider_${i}`} component="li" sx={{ mt: '5px' }} />
          ) : undefined,
          <ListItem
            key={`${word.id}_item_${i}`}
            sx={{ pt: 0, minHeight: '125px', mt: i === 0 ? '35px' : undefined }}
          >
            <WordListItem2 word={word} t={t} lang={lang} />
          </ListItem>,
        ];
      })}
    </List>
  );
};

const WordListItem: FC<{ word: Word; t: TFunction }> = ({ word, t }) => {
  const allTags = word.details
    .flatMap((wd) =>
      wd.definitions.flatMap((definition) => {
        const defnitionValueTags: string[] = definition.values.flatMap((v) => v.tags ?? []);
        return [...definition.tags, ...defnitionValueTags];
      }),
    )
    .filter((tag) => tag != 'см.' && tag != 'см.тж.')
    // Use filter and return array with unique values
    .filter((e, i, self) => i === self.indexOf(e));

  return (
    <Stack direction="column">
      <SpellingListItem
        key={`${word.id}_spelling`}
        id={word.id}
        spelling={word.spelling}
        sx={{ ml: 0, pl: 0 }}
      />
      <ListItemText
        primary={<ParsedTextComp text={word.details[0].definitions[0].values[0].value} />}
      />
      {allTags.length > 0 && (
        <Stack direction="row" spacing={2} sx={{ mt: '10px !important' }}>
          {allTags.map((tag, t_i) => (
            <TagComp
              key={`${word.id}_definition_tags_${tag}_${t_i}`}
              label={t(tag, { ns: 'tags' })}
            />
          ))}
        </Stack>
      )}
    </Stack>
  );
};

const WordListItem2: FC<{ word: Word; t: TFunction; lang: WebsiteLang }> = ({ word, t, lang }) => {
  const pathname = usePathname();
  const theme = useTheme();
  const isMdDown = useMediaQuery(theme.breakpoints.down('md'));

  const firstDefinition = word.details[0]?.definitions[0];

  const searchParams = useSearchParams();
  const starts = searchParams.get('s') ?? undefined;
  const contains = searchParams.get('c') ?? undefined;
  const ends = searchParams.get('e') ?? undefined;
  const spellingRegex = buildSpellingRegex({ starts, contains, ends });
  // When there is no need to use it will default to `word`
  const spellingVariantTitle: SpellingVariant | undefined = spellingRegex.test(word.spelling)
    ? undefined
    : word.spellingVariants.filter((sv) => spellingRegex.test(sv.spelling))[0];
  // const allTags = word.details
  //   .flatMap((wd) =>
  //     wd.definitions.flatMap((definition) => {
  //       const defnitionValueTags: string[] = definition.values.flatMap((v) => v.tags ?? []);
  //       return [...definition.tags, ...defnitionValueTags];
  //     }),
  //   )
  //   .filter((tag) => tag != 'см.' && tag != 'см.тж.')
  //   // Use filter and return array with unique values
  //   .filter((e, i, self) => i === self.indexOf(e));
  return (
    <Stack direction={isMdDown ? 'column' : 'row'} sx={{ width: '100%' }}>
      <Typography
        variant="h5"
        component="div"
        className={expressionFont.className}
        sx={{
          display: 'flex',
          flexDirection: isMdDown ? 'row' : 'column',
          minWidth: '250px',
          alignItems: 'baseline',
          mb: '8px',
          ml: '-8px',
        }}
      >
        {spellingVariantTitle == undefined
          ? toLowerCaseLezgi(word.spelling)
          : toLowerCaseLezgi(spellingVariantTitle.spelling)}
        {word.details[0]?.inflection && (
          <Typography variant="body2" color="text.secondary" sx={{ pl: isMdDown ? '10px' : 0 }}>
            {spellingVariantTitle == undefined
              ? word.details[0]?.inflection
              : langDialectToString(spellingVariantTitle.langDialect!, t, {
                  showOnlyDialect: true,
                })}
          </Typography>
        )}
      </Typography>
      <Stack direction="column" sx={{ width: '100%' }}>
        {firstDefinition &&
          firstDefinition.tags &&
          firstDefinition.tags.length > 0 &&
          firstDefinition.tags.map((tag, i) => (
            <TagComp key={`exp_det_${tag}_${i}`} label={t(tag, { ns: 'tags' })} />
          ))}
        {firstDefinition &&
          firstDefinition.values.slice(0, 3).map((def, i) => (
            <Stack
              key={`${word.id}_${i}`}
              direction="row"
              spacing={1}
              sx={{ alignItems: 'center' }}
            >
              <Typography
                variant="body1"
                sx={{
                  fontWeight: 'bold',
                  fontSize: '16px',
                  minWidth: '20px',
                  alignSelf: 'start',
                  marginTop: '4px !important',
                }}
              >
                {/* {idxToChar(lang, idx) + ' :'} */}
                {t(`alphabet.${i}`) + ' :'}
              </Typography>
              <Typography component={'div'} variant="body1" sx={{ fontSize: '20px' }}>
                {def.tags?.map((tag, t_i) => (
                  <TagComp
                    key={`exp_det_${i}_tags_${tag}_${t_i}`}
                    label={t(tag, { ns: 'tags' })}
                    styles={{ marginRight: '5px' }}
                  />
                ))}
                <ParsedTextComp text={def.value} />
              </Typography>
            </Stack>
          ))}
        {firstDefinition?.examples && firstDefinition.examples.length > 0 && (
          <>
            <br />
            <Typography variant="body2" color="text.secondary">
              {t('examples')}
            </Typography>
            {firstDefinition.examples?.slice(0, 1).map((example, i) => (
              <Typography
                key={`exp_det_${i}`}
                variant="body2"
                sx={{
                  borderLeftWidth: '2px',
                  borderLeftStyle: 'solid',
                  borderLeftColor: 'grey.300',
                  paddingLeft: '10px',
                }}
              >
                {
                  LangToId['lez']
                    .flatMap((langId) => example.phrasesPerLangDialect[langId])
                    .filter((p) => p)[0]?.phrase
                }
                <br />
                <i style={{ color: 'GrayText' }}>
                  {/* {example.phrasesPerLangDialect[LangToId['rus']].phrase} */}
                  {
                    LangToId['rus']
                      .flatMap((langId) => example.phrasesPerLangDialect[langId])
                      .filter((p) => p)[0].phrase
                  }
                </i>
              </Typography>
            ))}
          </>
        )}
        <SpellingVariantsList
          spelling={word.spelling}
          spellingVariants={word.spellingVariants}
          websiteLang={lang}
          wordLangDialect={word.langDialect}
          isRow={true}
        />
        <Typography sx={{ mt: '16px', cursor: 'pointer' }} variant="body2">
          <Link
            href={`${pathname}?fromLang=${IdToLang[word.langDialect.id]}&toLang=${IdToLang[word.details[0].langDialect.id]}&exp=${word.spelling}`}
            target="_blank"
          >
            {t('learnMore')}
          </Link>
        </Typography>
      </Stack>
    </Stack>
  );
};
