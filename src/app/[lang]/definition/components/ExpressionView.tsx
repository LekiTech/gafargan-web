'use client';
import React, { FC } from 'react';
import { ExpressionSearchResponseDto } from '@api/types.dto';
import { WebsiteLang } from '@api/types.model';
import { Box, Skeleton, Stack, Typography } from '@mui/material';
import { Sidebar } from './Sidebar';
import { toContents } from '../utils';
import { ExpressionDetailsComp } from './ExpressionDetailsComp';

type ExpressionViewProps = {
  lang: WebsiteLang;
  expression?: ExpressionSearchResponseDto;
  labels: {
    otherExamples: string;
  };
};

export const ExpressionView: FC<ExpressionViewProps> = ({ lang, expression, labels }) => {
  if (!expression) {
    return (
      <Box>
        <Typography variant="h1">
          <Skeleton />
        </Typography>
      </Box>
    );
  }
  const { found: foundExpression, similar: similarExpressions } = expression;
  const foundInExamples = foundExpression
    ? [
        /* API request */
      ]
    : [];
  const foundInDefinitions = foundExpression
    ? [
        /* API request */
      ]
    : [];
  // if (!expression) {
  //   return <div>not found</div>;
  // }
  //);
  // const dictionary = useSelector((state: any): DictionaryReduxState => state.dictionary);
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
      }}
    >
      {foundExpression && foundExpression.details ? (
        <Stack
          direction={'row'}
          spacing={2}
          sx={{
            maxWidth: '1400px',
          }}
        >
          <Sidebar
            contents={foundExpression.details.map((d, i) =>
              toContents(i, foundExpression.spelling, d),
            )}
            otherExamplesLabel={labels.otherExamples}
          />
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'left',
              justifyContent: 'center',
              width: '100vw',
              pt: '25px',
              pl: '25px',
              pb: '50px',
            }}
          >
            {foundExpression.details.map((detail, i) => (
              <ExpressionDetailsComp
                key={`exp_det_${i}`}
                idx={i}
                lang={lang}
                spelling={foundExpression.spelling}
                data={detail}
                isLast={i === foundExpression.details.length - 1}
              />
            ))}
          </Box>
        </Stack>
      ) : (
        // TODO: add component for each of the following
        // TODO: add API request for each of the following
        <Stack direction={'column'} spacing={2}>
          {similarExpressions?.map((s, i) => (
            <Box key={`similar_${i}`}>{s.spelling}</Box>
          ))}
          {foundInExamples.map((s, i) => (
            <Box key={`foundInExamples_${i}`}>{s}</Box>
          ))}
          {foundInDefinitions.map((s, i) => (
            <Box key={`foundInDefinitions_${i}`}>{s}</Box>
          ))}
        </Stack>
      )}
    </Box>
  );
};
