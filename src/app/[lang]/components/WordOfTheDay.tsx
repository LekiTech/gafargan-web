'use client';
import * as React from 'react';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { FC } from 'react';
import { useTranslation } from '@i18n/index';
import images from '@/store/images';
import {
  Card,
  CardActionArea,
  CardContent,
  CardActions,
  CardMedia,
  Link,
  Chip,
  Stack,
} from '@mui/material';
import { colors } from '@/colors';
import { expressionFont } from '@/fonts';

type WordOfTheDayProps = {
  labels: {
    wordOfTheDay: string;
    examples: string;
    learnMore: string;
  };
};

export const WordOfTheDay: FC<WordOfTheDayProps> = ({ labels }) => {
  const { wordOfTheDay, examples, learnMore } = labels;
  return (
    <Card sx={{ minWidth: 275, height: 365, padding: '20px' }}>
      <CardContent
        sx={{
          width: '100%',
          height: '100%',
          // flex: 2,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          alignItems: 'stretch',
        }}
      >
        <Typography
          // sx={{ fontSize: 14 }}
          variant="h5"
          // color="text.secondary"
          gutterBottom
        >
          {wordOfTheDay}
        </Typography>
        <Typography variant="h4" component="div" className={expressionFont.className}>
          {`ПАТАЛАЙ`.toLowerCase()}
        </Typography>
        {/* <Typography sx={{ mb: 1.5 }} variant="body2" color="text.secondary">
            {`послелог`}
          </Typography> */}
        <Stack direction="row" spacing={2}>
          <Chip sx={{ maxWidth: '250px', width: 'wrap-content' }} label={`послелог`} />
        </Stack>
        <Typography variant="subtitle1">{`вместо, за, от`}</Typography>
        <br />
        {/* <br /> */}
        <Typography variant="body2" color="text.secondary">
          {examples}
        </Typography>
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
        <Typography sx={{ m: 1.5, textAlign: 'end', cursor: 'pointer' }} variant="body2">
          <Link>{learnMore}</Link>
        </Typography>
      </CardContent>
    </Card>
  );
};
