import React, { FC } from 'react';
import { Box, Grid } from '@mui/material';
import { useTranslation } from '@i18n/index';
import { WordOfTheDay } from './components/WordOfTheDay';
import { NumbersWidget } from './components/NumbersWidget';
import { Sources } from './components/Sources';

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

  return (
    <Box
      sx={{ pt: '150px', pb: '150px', width: '100%', display: 'flex', justifyContent: 'center' }}
    >
      <Grid container spacing={5} sx={{ maxWidth: '1400px' }}>
        <Grid item xs={6}>
          <WordOfTheDay
            labels={{
              wordOfTheDay: t('wordOfTheDay'),
              examples: t('examples'),
              learnMore: t('learnMore'),
            }}
          />
        </Grid>
        <Grid item xs={6}>
          <NumbersWidget
            title={t('translateNumbers')}
            translationLabel={t(`translation`)}
            enterNumberLabel={t('enterNumber')}
          />
        </Grid>
        <Grid item xs={12}>
          <Sources labels={{ sources: t('sources'), learnMore: t('learnMore') }} />
        </Grid>
      </Grid>
    </Box>
  );
};

export default Home;
