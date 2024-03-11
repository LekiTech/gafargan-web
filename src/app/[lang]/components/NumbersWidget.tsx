'use client';
import React, { FC, useState } from 'react';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import SpeakNumIcon from '@mui/icons-material/VolumeUp';
import { IconButton, TextField } from '@mui/material';
import { numToLezgi, lezgiToNum, playLezgiNumberTts } from 'lezgi-numbers/lib';
import { expressionFont } from '@/fonts';
import { copyText } from '../../utils';

type NumbersToLezgiProps = {
  title: string;
  enterNumberLabel: string;
  translationLabel: string;
};

function convertToLezgiAndFormat(num: number): string {
  const newResult = numToLezgi(num);
  return newResult.charAt(0).toUpperCase() + newResult.slice(1);
}
const defaultNumber = new Date().getFullYear();
export const NumbersToLezgi: FC<NumbersToLezgiProps> = ({
  title,
  translationLabel,
  enterNumberLabel,
}) => {
  const [originalInput, setOriginalInput] = useState(defaultNumber);
  const [result, setResult] = useState(convertToLezgiAndFormat(defaultNumber));
  return (
    <Card sx={{ display: 'flex', minWidth: 275, height: 365, padding: '20px' }}>
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
            setOriginalInput(inputValue);
            const newValue = inputValue.toLocaleString('en-US').replaceAll(',', ' ');
            e.target.value = newValue;
            setResult(convertToLezgiAndFormat(inputValue));
            e.target.selectionStart = e.target.selectionEnd = newValue.length - endOffset;
          }}
        />
        <Typography variant="caption" color="text.secondary">
          {translationLabel}
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

type LezgiToNumbersProps = {
  title: string;
  enterTextLabel: string;
  numberLabel: string;
};
function convertLezgiToNumberAndFormat(lezgiNumeral: string): string {
  try {
    const preprocessed = lezgiNumeral.toLowerCase().replaceAll(/(?<=[кптцчКПТЦЧ])[i1lӏ|!]/g, 'I');
    const newResult = lezgiToNum(preprocessed);
    return newResult.toLocaleString('en-US').replaceAll(',', ' ');
  } catch (e) {
    return '...';
  }
}
const defaultNumericalText = 'Агъзурни кIуьд вишни къанни цIуд';
export const LezgiToNumbers: FC<LezgiToNumbersProps> = ({ title, enterTextLabel, numberLabel }) => {
  const [result, setResult] = React.useState(convertLezgiToNumberAndFormat(defaultNumericalText));
  return (
    <Card sx={{ display: 'flex', minWidth: 275, height: 365, padding: '20px' }}>
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
        <TextField
          label={enterTextLabel}
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
        <Typography variant="caption" color="text.secondary">
          {numberLabel}
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
