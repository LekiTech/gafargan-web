import React, { FC, Suspense } from 'react';
import { Box, Grid } from '@mui/material';
import { initTranslations } from '@i18n/index';
import { WordOfTheDay } from './components/WordOfTheDay';
import { LezgiToNumbers, NumbersToLezgi } from './components/NumbersWidget';
import { Sources } from './components/Sources';
// import * as expressionApi from '../../api/expressionApi';
// import * as dictionaryApi from '../../api/dictionaryApi';
import { VerticalSpacing } from './components/VerticalSpacing';
import { getWordOfTheDay } from '@repository/word.repository';
import { getSources } from '@repository/source.repository';
import { Params, SearchParams } from '../types';

type HomeProps = {
  params: Params;
  searchParams: SearchParams;
};

const Home: FC<HomeProps> = async (props) => {
  const { params } = props;
  const { lang } = await params;
  const { t } = await initTranslations(lang);
  const wordOfTheDay = await getWordOfTheDay();
  const sources = await getSources();

  return (
    <Box
      sx={{
        width: '100%',
        display: 'flex',
        // justifyContent: 'center',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      <Suspense>
        <VerticalSpacing />
        <Grid container spacing={5} sx={{ maxWidth: '1400px' }}>
          <Grid size={{ xs: 12, lg: 4 }} sx={{ display: 'flex', flexDirection: 'column' }}>
            <WordOfTheDay
              // TODO: fix Skeleton loading
              word={wordOfTheDay}
              labels={{
                wordOfTheDay: t('wordOfTheDay'),
                examples: t('examples'),
                learnMore: t('learnMore'),
              }}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6, lg: 4 }} sx={{ display: 'flex', flexDirection: 'column' }}>
            <NumbersToLezgi />
          </Grid>
          <Grid size={{ xs: 12, md: 6, lg: 4 }} sx={{ display: 'flex', flexDirection: 'column' }}>
            <LezgiToNumbers />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <Sources
              labels={{ sources: t('sources'), learnMore: t('learnMore') }}
              sources={sources}
            />
          </Grid>
        </Grid>
      </Suspense>
    </Box>
  );
};

export default Home;
