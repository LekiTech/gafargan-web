import React, { FC, Suspense } from 'react';
import { Box, Grid } from '@mui/material/index';
import { initTranslations } from '@i18n/index';
import { WordOfTheDay } from './components/WordOfTheDay';
import { LezgiToNumbers, NumbersToLezgi } from './components/NumbersWidget';
import { Sources } from './components/Sources';
import * as expressionApi from '../../api/expressionApi';
import * as dictionaryApi from '../../api/dictionaryApi';
import { VerticalSpacing } from './components/VerticalSpacing';

type HomeProps = {
  params: { lang: string };
  searchParams: { fromLang: string; toLang: string };
};

const Home: FC<HomeProps> = async (props) => {
  const {
    params: { lang },
    searchParams: { fromLang, toLang },
  } = props;
  const { t } = await initTranslations(lang);
  const date = new Date();
  const wordOfTheDay = await expressionApi.wordOfTheDay(
    `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`, //19
  );
  const sources = await dictionaryApi.getSources();
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
          <Grid item xs={12} lg={4}>
            <WordOfTheDay
              // TODO: fix Skeleton loading
              expression={wordOfTheDay!}
              labels={{
                wordOfTheDay: t('wordOfTheDay'),
                examples: t('examples'),
                learnMore: t('learnMore'),
              }}
            />
          </Grid>
          <Grid item xs={12} md={6} lg={4}>
            <NumbersToLezgi />
          </Grid>
          <Grid item xs={12} md={6} lg={4}>
            <LezgiToNumbers />
          </Grid>
          <Grid item xs={12}>
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
