'use client';
import React, { FC, useState } from 'react';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import SpeakNumIcon from '@mui/icons-material/VolumeUp';
import { Box, IconButton, TextField } from '@mui/material';
import { numToLezgi, lezgiToNum, playLezgiNumberTts } from 'lezgi-numbers/lib';
import { expressionFont } from '@/fonts';
import { useTranslation } from 'react-i18next';
import { copyText, toLowerCaseLezgi } from '../../utils'

function convertToLezgiAndFormat(num: number): string {
  const newResult = numToLezgi(num);
  return newResult.charAt(0).toUpperCase() + newResult.slice(1);
}
const defaultNumber = new Date().getFullYear();
export const NumbersToLezgi: FC = () => {
  const { t } = useTranslation();
  const [originalInput, setOriginalInput] = useState(defaultNumber);
  const [result, setResult] = useState(convertToLezgiAndFormat(defaultNumber));
  return (
    <Card sx={{ display: 'flex', minWidth: 275, flexGrow: 1, padding: '20px' }}>
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
          {t('translateNumbers')}
        </Typography>
        <TextField
          label={t('enterNumber')}
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
            setOriginalInput(inputValue);
            const newValue = inputValue.toLocaleString('en-US').replaceAll(',', ' ');
            e.target.value = newValue;
            setResult(convertToLezgiAndFormat(inputValue));
            e.target.selectionStart = e.target.selectionEnd = newValue.length - endOffset;
          }}
        />
        <Box>
          <Typography variant="caption" color="text.secondary">
            {t(`translation`)}
          </Typography>
          <Typography
            variant="h6"
            sx={{
              fontSize: '1.1rem',
              borderLeftWidth: '2px',
              borderLeftStyle: 'solid',
              borderLeftColor: 'grey.300',
              paddingLeft: '10px',
            }}
            className={expressionFont.className}
          >
            {result}
          </Typography>
        </Box>
      </CardContent>
      <CardActions sx={{ display: 'flex', alignItems: 'end' }}>
        <IconButton color="primary" aria-label="copy" onClick={() => copyText(result)}>
          <ContentCopyIcon />
        </IconButton>
        <IconButton
          color="primary"
          onClick={() => {
            playLezgiNumberTts(originalInput, '/api/res/');
          }}
        >
          <SpeakNumIcon />
        </IconButton>
      </CardActions>
    </Card>
  );
};

function convertLezgiToNumberAndFormat(lezgiNumeral: string): string {
  try {
    const preprocessed = toLowerCaseLezgi(lezgiNumeral);
    const newResult = lezgiToNum(preprocessed);
    return newResult.toLocaleString('en-US').replaceAll(',', ' ');
  } catch (e) {
    return '...';
  }
}
const defaultNumericalText = 'Агъзурни кIуьд вишни къанни цIуд';
export const LezgiToNumbers: FC = () => {
  const [result, setResult] = React.useState(convertLezgiToNumberAndFormat(defaultNumericalText));
  const { t } = useTranslation();
  return (
    <Card sx={{ display: 'flex', minWidth: 275, flexGrow: 1, padding: '20px' }}>
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
          {t('translateNumbers')}
        </Typography>
        <TextField
          label={t(`enterLezgiNumeral`)}
          defaultValue={defaultNumericalText}
          multiline
          sx={{ width: '100%', mb: '10px' }}
          inputProps={{
            inputMode: 'text',
            pattern: '[ 1iI\u0400-\u04ff]*',
          }}
          onChange={(e) => {
            const inputValue = e.target.value;
            if (inputValue === '') {
              setResult('...');
              return;
            }
            setResult(convertLezgiToNumberAndFormat(inputValue));
          }}
        />
        <Box>
          <Typography variant="caption" color="text.secondary">
            {t(`number`)}
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
        </Box>
      </CardContent>
      <CardActions sx={{ display: 'flex', alignItems: 'end' }}>
        <IconButton
          color="primary"
          aria-label="copy"
          onClick={() => copyText(result.replaceAll(' ', ''))}
        >
          <ContentCopyIcon />
        </IconButton>
        <IconButton
          color="primary"
          onClick={() => {
            const num = parseInt(result.replaceAll(' ', ''));
            if (!Number.isInteger(num)) {
              return;
            }
            playLezgiNumberTts(num, '/api/res/');
          }}
        >
          <SpeakNumIcon />
        </IconButton>
      </CardActions>
    </Card>
  );
};
