'use client';
import * as React from 'react';
import Typography from '@mui/material/Typography';
import { FC } from 'react';
import { Card, CardContent, Link, Chip, Stack } from '@mui/material';
import { expressionFont } from '@/fonts';
import { Expression } from '../../../api/types.model';
import { capitalizeFirstLetter } from '@/definition/utils';
import { usePathname } from 'next/navigation';
import { ParsedTextComp } from './ParsedTextComp';
import { toLowerCaseLezgi } from '../../utils';

type WordOfTheDayProps = {
  expression: Expression;
  labels: {
    wordOfTheDay: string;
    examples: string;
    learnMore: string;
  };
};

const DEFAULT_EXPRESSION_LANG = 'lez';
const DEFAULT_DEFINITION_LANG = 'rus';

export const WordOfTheDay: FC<WordOfTheDayProps> = ({ expression, labels }) => {
  const pathname = usePathname();
  const { wordOfTheDay, examples, learnMore } = labels;
  const firstDefinition = expression.details[0]?.definitionDetails[0];
  return (
    <Card sx={{ minWidth: 275, height: 365, padding: '20px' }}>
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
        <Typography variant="h5" gutterBottom>
          {wordOfTheDay}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {`${expression.details[0]?.writtenSources[0].title} - ${expression.details[0]?.writtenSources[0].authors}`}
        </Typography>
        <Typography variant="h3" component="div" className={expressionFont.className}>
          {capitalizeFirstLetter(toLowerCaseLezgi(expression.spelling))}
        </Typography>
        {expression.details[0]?.inflection && (
          <Typography variant="body2" color="text.secondary" sx={{ mb: '10px' }}>
            {expression.details[0]?.inflection}
          </Typography>
        )}
        {(firstDefinition?.tags || firstDefinition?.definitions) && (
          <Stack direction="row" spacing={2}>
            {firstDefinition.tags &&
              firstDefinition.tags.length > 0 &&
              firstDefinition.tags.map((tag, i) => (
                <Chip
                  key={`exp_det_${tag}_${i}`}
                  sx={{ maxWidth: '250px', width: 'wrap-content' }}
                  label={tag}
                />
              ))}
            {firstDefinition?.definitions &&
              firstDefinition.definitions[0]?.tags &&
              firstDefinition.definitions[0].tags.length > 0 &&
              firstDefinition.definitions[0].tags.map((tag, i) => (
                <Chip
                  key={`exp_det_${tag}_${i}`}
                  sx={{ maxWidth: '250px', width: 'wrap-content' }}
                  label={tag}
                />
              ))}
          </Stack>
        )}
        {firstDefinition?.definitions && firstDefinition.definitions.length > 0 && (
          <ul>
            {firstDefinition.definitions.slice(0, 3).map((def, i) => (
              <Typography key={`${def.value}_${i}`} component="li" variant="subtitle1">
                <ParsedTextComp text={def.value} />
              </Typography>
            ))}
          </ul>
        )}
        {firstDefinition?.examples && firstDefinition.examples.length > 0 && (
          <>
            <br />
            <Typography variant="body2" color="text.secondary">
              {examples}
            </Typography>
            {firstDefinition.examples?.slice(0, 1).map((example, i) => (
              <Typography
                key={`exp_det_${i}`}
                variant="body2"
                sx={{
                  borderLeftWidth: '2px',
                  borderLeftStyle: 'solid',
                  borderLeftColor: 'grey.300',
                  paddingLeft: '10px',
                }}
              >
                {example.src}
                <br />
                <i style={{ color: 'GrayText' }}>{example.trl}</i>
              </Typography>
            ))}
          </>
        )}
        <Typography sx={{ m: 1.5, textAlign: 'end', cursor: 'pointer' }} variant="body2">
          <Link
            href={`${pathname}/definition?fromLang=${DEFAULT_EXPRESSION_LANG}&toLang=${DEFAULT_DEFINITION_LANG}&exp=${expression.spelling}`}
          >
            {learnMore}
          </Link>
        </Typography>
      </CardContent>
    </Card>
  );
};
