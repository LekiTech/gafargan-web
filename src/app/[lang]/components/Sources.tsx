'use client';
import React, { FC } from 'react';
import Typography from '@mui/material/Typography';
import { useTranslation } from '@i18n/index';
import { Card, CardContent, Link, Stack } from '@mui/material';
import { WrittenSource } from '@api/types.model';
import WrittenSourceAccordion from './WrittenSourceAccordion';

type WordOfTheDayProps = {
  sources: WrittenSource[];
  labels: {
    sources: string;
    learnMore: string;
  };
};

export const Sources: FC<WordOfTheDayProps> = ({ sources, labels }) => {
  const { sources: sourcesLabel, learnMore: learnMoreLabel } = labels;
  return (
    <Card sx={{ minWidth: 275 }}>
      <CardContent
        sx={{
          display: 'flex',
          flex: 1,
          flexDirection: 'column',
          justifyContent: 'space-between',
          alignItems: 'stretch',
        }}
      >
        <Typography variant="h5" component="div">
          {sourcesLabel}
        </Typography>
        <Stack direction="column" sx={{ m: 3 }}>
          {sources.map((s, i) => (
            <WrittenSourceAccordion key={`written-source-${i}`} source={s} />
          ))}
        </Stack>
        {/* <Typography sx={{ m: 1.5, textAlign: 'end', cursor: 'pointer' }} variant="body2">
          <Link>{learnMoreLabel}</Link>
        </Typography> */}
      </CardContent>
      {/* <CardActions>
        <Button size="small">{t('learnMore')}</Button>
      </CardActions> */}
    </Card>
  );
};
