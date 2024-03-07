import React, { FC } from 'react';
import { Box, Grid } from '@mui/material/index';
import { useTranslation } from '@i18n/index';
import { WordOfTheDay } from './components/WordOfTheDay';
import { LezgiToNumbers, NumbersToLezgi } from './components/NumbersWidget';
import { Sources } from './components/Sources';
import * as expressionApi from '@api/expressionApi';
import * as dictionaryApi from '@api/dictionaryApi';

type HomeProps = {
  params: { lang: string };
  searchParams: { fromLang: string; toLang: string };
};

const Home: FC<HomeProps> = async (props) => {
  const {
    params: { lang },
    searchParams: { fromLang, toLang },
  } = props;
  const { t } = await useTranslation(lang);
  const date = new Date();
  const wordOfTheDay = await expressionApi.wordOfTheDay(
    `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`, //19
  );
  const sources = await dictionaryApi.getSources();
  return (
    <Box
      sx={{ pt: '150px', pb: '150px', width: '100%', display: 'flex', justifyContent: 'center' }}
    >
      <Grid container spacing={5} sx={{ maxWidth: '1400px' }}>
        <Grid item xs={4}>
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
        <Grid item xs={4}>
          <NumbersToLezgi
            title={t('translateNumbers')}
            translationLabel={t(`translation`)}
            enterNumberLabel={t('enterNumber')}
          />
        </Grid>
        <Grid item xs={4}>
          <LezgiToNumbers
            title={t('translateNumbers')}
            enterTextLabel={t(`translation`)}
            numberLabel={t('enterNumber')}
          />
        </Grid>
        <Grid item xs={12}>
          <Sources
            labels={{ sources: t('sources'), learnMore: t('learnMore') }}
            sources={sources}
          />
        </Grid>
      </Grid>
    </Box>
  );
};

export default Home;
