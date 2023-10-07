import * as React from 'react';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { FC } from 'react';
import { useTranslation } from '@i18n/index';
import images from '@/store/images';
import { Card, CardActionArea, CardContent, CardActions, CardMedia, Link } from '@mui/material';

type WordOfTheDayProps = {
  lang: string;
};

export const Sources: FC<WordOfTheDayProps> = async ({ lang }) => {
  const { t } = await useTranslation(lang);
  return (
    <Card sx={{ minWidth: 275, height: 365, padding: '20px' }}>
      {/* <CardActionArea
        sx={{
          width: '100%',
          height: '100%',
          p: '20px',
        }}
      > */}
      {/* <CardMedia
          component="img"
          height="340"
          image={images.booksImage.src}
          alt="sources"
          sx={{ objectPosition: 'center bottom' }}
        /> */}
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
          {t('sources')}
        </Typography>
        <br />
        <br />

        <Typography sx={{ m: 1.5, textAlign: 'end', cursor: 'pointer' }} variant="body2">
          <Link>{t('learnMore')}</Link>
        </Typography>
      </CardContent>
      {/* </CardActionArea> */}
      {/* <CardActions>
        <Button size="small">{t('learnMore')}</Button>
      </CardActions> */}
    </Card>
  );
};
