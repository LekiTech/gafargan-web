'use client';
import React, { CSSProperties, FC } from 'react';
import { WebsiteLang } from '../../../../../api/types.model';
import { Box, Divider, List, ListItem, ListItemText, Typography } from '@mui/material';
import { langDialectToString } from '../utils';
import { useTranslation } from 'react-i18next';
import { toLowerCaseLezgi } from '../../../../utils';
import { SpellingVariant } from '@repository/entities/SpellingVariant';
import { LangDialect } from '@repository/entities/LangDialect';

export type SpellingVariantsListProps = {
  spelling: string;
  spellingVariants: SpellingVariant[];
  websiteLang: WebsiteLang;
  wordLangDialect: LangDialect;
  isRow?: boolean;
};

export const SpellingVariantsList: FC<SpellingVariantsListProps> = ({
  spelling,
  spellingVariants,
  websiteLang,
  wordLangDialect,
  isRow,
}) => {
  const { t } = useTranslation(websiteLang);
  const dividingBorderStyle: CSSProperties =
    isRow === true
      ? {
          borderRightWidth: '1px',
          borderRightStyle: 'solid',
          borderRightColor: '#ccc',
        }
      : {
          borderBottomWidth: '1px',
          borderBottomStyle: 'solid',
          borderBottomColor: '#ccc',
        };
  return (
    (spellingVariants.length ?? 0) > 0 && (
      <Box
        sx={(theme) => ({
          minWidth: '250px',
          // [theme.breakpoints.down('md')]: {
          // order: 2,
          width: '100%',
          ml: '0px !important',
          pt: '15px',
          boxSizing: 'border-box',
          '&.MuiBox-root': {
            ml: '0px !important',
            mt: '10px',
          },
          // },
        })}
      >
        <Typography
          variant="h6"
          sx={(theme) => ({
            // [theme.breakpoints.down('md')]: {
            pl: '15px',
            // }
          })}
        >
          {t(`wordVariants`, { ns: 'common' })}
        </Typography>
        <List
          sx={(theme) => ({
            display: 'flex',
            // flexDirection: 'column',
            // [theme.breakpoints.down('md')]: {
            flexDirection: isRow === true ? 'row' : 'column',
            p: 0,
            overflow: 'auto',
            maxWidth: '100vw',
            // },
          })}
        >
          <Divider
            sx={(theme) => ({
              // [theme.breakpoints.down('md')]: {
              display: 'none',
              // }
            })}
          />
          <ListItem
            sx={(theme) => ({
              pt: 0,
              mb: '10px',
              pl: '15px',
              pr: '15px',
              ml: 0,
              width: 'fit-content',
              // [theme.breakpoints.down('md')]: {
              // borderRightWidth: '1px',
              // borderRightStyle: 'solid',
              // borderRightColor: '#ccc',
              ...dividingBorderStyle,
              // },
            })}
          >
            <ListItemText
              primary={toLowerCaseLezgi(spelling)}
              secondary={langDialectToString(wordLangDialect, t, {
                showOnlyDialect: true,
              })}
            />
          </ListItem>
          {spellingVariants.map((variant, i) => (
            <ListItem
              key={`variant_${i}`}
              sx={(theme) => ({
                pt: 0,
                mb: '10px',
                pl: '15px',
                pr: '15px',
                ml: 0,
                width: 'fit-content',
                // [theme.breakpoints.down('md')]:
                ...(i < spellingVariants.length - 1 ? dividingBorderStyle : {}),
              })}
            >
              <ListItemText
                primary={toLowerCaseLezgi(variant.spelling)}
                secondary={langDialectToString(variant.langDialect!, t, {
                  showOnlyDialect: true,
                })}
              />
            </ListItem>
          ))}
        </List>
      </Box>
    )
  );
};
