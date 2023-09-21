import React, { FC, use } from 'react';
import { useRouter } from 'next/router';
import images from '@/store/images';
import {
  Autocomplete,
  Box,
  Button,
  Grid,
  IconButton,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useTranslation } from '../i18n';
import Search from './components/Search';
import { WebsiteLang } from './api/types';
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
    <Box sx={{ paddingTop: '50px', width: '100%', display: 'flex', justifyContent: 'center' }}>
      <Grid container spacing={5} sx={{ maxWidth: '1140px' }}>
        <Grid item xs={6}>
          <WordOfTheDay lang={lang} />
        </Grid>
        <Grid item xs={6}>
          <NumbersWidget
            title={t('translateNumbers')}
            translationLabel={t(`translation`)}
            enterNumberLabel={t('enterNumber')}
          />
        </Grid>
        <Grid item xs={12}>
          <Sources lang={lang} />
        </Grid>
      </Grid>
    </Box>
  );
};

export default Home;
