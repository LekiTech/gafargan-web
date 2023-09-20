import * as React from 'react';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { FC } from 'react';
import { useTranslation } from '../../i18n';
import images from '@/store/images';
import { Card, CardActionArea, CardContent, CardActions, CardMedia, Link } from '@mui/material';
import { colors } from '@/colors';
import { expressionFont } from '@/fonts';

type WordOfTheDayProps = {
  lang: string;
};

export const WordOfTheDay: FC<WordOfTheDayProps> = async ({ lang }) => {
  const { t } = await useTranslation(lang);
  return (
    <Card sx={{ minWidth: 275, minHeight: 265 }}>
      <CardActionArea sx={{ display: 'flex' }}>
        {/* <CardMedia
          component="img"
          height="240"
          image={images.calendarImage.src}
          alt="word of the day"
          sx={{ objectPosition: 'center bottom', flex: 1 }}
        /> */}
        <CardContent sx={{ flex: 2 }}>
          <Typography
            // sx={{ fontSize: 14 }}
            variant="h5"
            // color="text.secondary"
            gutterBottom
          >
            {t('wordOfTheDay')}
          </Typography>
          <Typography variant="h4" component="div" className={expressionFont.className}>
            {`ПАТАЛАЙ`.toLowerCase()}
          </Typography>
          <Typography sx={{ mb: 1.5 }} variant="body2" color="text.secondary">
            {`послелог`}
          </Typography>
          <Typography variant="subtitle1">{`вместо, за, от`}</Typography>
          <br />
          {/* <br /> */}
          <Typography
            variant="body2"
            sx={{
              borderLeftWidth: '2px',
              borderLeftStyle: 'solid',
              borderLeftColor: 'grey.300',
              paddingLeft: '10px',
            }}
          >
            {`жуван стхадиз чи паталайни мехъер мубарак ая`}
            <br />
            <i style={{ color: 'GrayText' }}>{`поздравь своего брата со свадьбой и от нас`}</i>
          </Typography>
          <Typography sx={{ mt: 1.5, textAlign: 'end' }} variant="body2">
            <Link>{t('learnMore')}</Link>
          </Typography>
        </CardContent>
      </CardActionArea>
      {/* <CardActions>
        <Button size="small">{t('learnMore')}</Button>
      </CardActions> */}
    </Card>
  );
};
