'use client';
import React, { FC } from 'react';
import Typography from '@mui/material/Typography';
import { Box, Card, CardContent, Link, Paper, Stack } from '@mui/material';
import WrittenSourceAccordion from './WrittenSourceAccordion';
import { Source } from '@repository/entities/Source';

type WordOfTheDayProps = {
  sources: Source[];
  labels: {
    sources: string;
    fieldworkData: string;
  };
};

export const Sources: FC<WordOfTheDayProps> = ({ sources, labels }) => {
  const { sources: sourcesLabel, fieldworkData: fieldworkDataLabel } = labels;
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
        <Stack direction="column" sx={{ m: '25px 0' }}>
          {sources
            .filter((s) => s.id > 0)
            .map((s, i) => (
              <WrittenSourceAccordion key={`written-source-${i}`} source={s} />
            ))}
          <Paper
            sx={(theme) => ({
              display: 'flex',
              alignItems: 'center',
              flexDirection: 'row',
              mt: '2px',
              zIndex: 1,
              py: '12px',
              px: '16px',
              [theme.breakpoints.down('md')]: {
                flexDirection: 'column',
                alignItems: 'flex-start',
              },
            })}
          >
            <Typography>🗣️ {fieldworkDataLabel}</Typography>
          </Paper>
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
