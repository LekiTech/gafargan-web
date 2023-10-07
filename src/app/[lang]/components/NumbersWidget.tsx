'use client';
import React, { FC } from 'react';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import images from '@/store/images';
import { CardMedia, IconButton, TextField } from '@mui/material';
import { numToLezgi, lezgiToNum } from 'lezgi-numbers/lib';
import { expressionFont } from '@/fonts';

type NumbersWidgetProps = {
  title: string;
  enterNumberLabel: string;
  translationLabel: string;
};

function createResult(num: number): string {
  const newResult = numToLezgi(num);
  return newResult.charAt(0).toUpperCase() + newResult.slice(1);
}

export const NumbersWidget: FC<NumbersWidgetProps> = ({
  title,
  translationLabel,
  enterNumberLabel,
}) => {
  const defaultNumber = new Date().getFullYear();
  const [result, setResult] = React.useState(createResult(defaultNumber));
  return (
    <Card sx={{ display: 'flex', minWidth: 275, height: 365, padding: '20px' }}>
      {/* <CardMedia
        component="img"
        height="240"
        image={images.numbersImage.src}
        alt="numbers"
        sx={{ flex: 1 }}
      /> */}
      <CardContent
        sx={{
          flex: 2,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          alignItems: 'stretch',
        }}
      >
        <Typography gutterBottom variant="h5">
          {title}
        </Typography>
        <br />
        <TextField
          label={enterNumberLabel}
          defaultValue={defaultNumber}
          sx={{ width: '100%', mb: '10px' }}
          inputProps={{
            inputMode: 'numeric',
            pattern: '[0-9]*',
            min: '-9007199254740991',
            max: '9007199254740991',
          }}
          onChange={(e) => {
            const caret = e.target.selectionStart;
            const endOffset = e.target.value.length - (caret ?? 0);
            const ivs = e.target.value.replaceAll(/,|\.| /g, '');
            if (ivs === '') {
              setResult('...');
              return;
            }
            let inputValue = parseInt(ivs);
            if (!Number.isInteger(inputValue)) {
              return;
            }
            if (inputValue > Number.MAX_SAFE_INTEGER) {
              inputValue = Number.MAX_SAFE_INTEGER;
            }
            if (inputValue < Number.MIN_SAFE_INTEGER) {
              inputValue = Number.MIN_SAFE_INTEGER;
            }
            const newValue = inputValue.toLocaleString('en-US').replaceAll(',', ' ');
            e.target.value = newValue;
            setResult(createResult(inputValue));
            e.target.selectionStart = e.target.selectionEnd = newValue.length - endOffset;
          }}
        />
        <br />
        <br />
        <Typography variant="caption" color="text.secondary">
          {translationLabel}
        </Typography>
        <Typography
          variant="h6"
          sx={{
            borderLeftWidth: '2px',
            borderLeftStyle: 'solid',
            borderLeftColor: 'grey.300',
            paddingLeft: '10px',
          }}
          className={expressionFont.className}
        >
          {result}
        </Typography>
      </CardContent>
      <CardActions sx={{ display: 'flex', alignItems: 'end' }}>
        {/* <Button size="small" color="primary">
          Copy
        </Button> */}
        <IconButton
          color="primary"
          aria-label="copy"
          onClick={() => navigator.clipboard.writeText(result)}
        >
          <ContentCopyIcon />
        </IconButton>
      </CardActions>
    </Card>
  );
};
