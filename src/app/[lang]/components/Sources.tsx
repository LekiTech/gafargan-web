'use client';
import React, { FC } from 'react';
import Typography from '@mui/material/Typography';
import { useTranslation } from '@i18n/index';
import { Card, CardContent, Link } from '@mui/material';

type WordOfTheDayProps = {
  labels: {
    sources: string;
    learnMore: string;
  };
};

export const Sources: FC<WordOfTheDayProps> = ({ labels }) => {
  const { sources, learnMore } = labels;
  return (
    <Card sx={{ minWidth: 275, height: 365, padding: '20px' }}>
      <CardContent
        sx={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          alignItems: 'stretch',
        }}
      >
        <Typography variant="h5" component="div">
          {/* {t('sources')} */}
          {sources}
        </Typography>
        <br />
        <br />

        <Typography sx={{ m: 1.5, textAlign: 'end', cursor: 'pointer' }} variant="body2">
          <Link>{learnMore}</Link>
        </Typography>
      </CardContent>
      {/* <CardActions>
        <Button size="small">{t('learnMore')}</Button>
      </CardActions> */}
    </Card>
  );
};
