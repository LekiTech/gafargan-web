'use client';
import React, { useEffect, useState } from 'react';
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  Link,
  Box,
} from '@mui/material';
import { remark } from 'remark';
import html from 'remark-html';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { WrittenSource } from '../../../api/types.model';
import { useTranslation } from 'react-i18next';

type WrittenSourceProps = {
  source: WrittenSource;
};

const WrittenSourceAccordion: React.FC<WrittenSourceProps> = ({ source }) => {
  const [contentHtml, setContentHtml] = useState('');
  const { t } = useTranslation();
  useEffect(() => {
    if (source.description) {
      const preprocessedDescription = source.description.replaceAll('\\n', '\n\n');
      remark()
        .use(html)
        .process(preprocessedDescription)
        .then((processedContent) => {
          setContentHtml(processedContent.toString());
        });
    }
  });
  return (
    <Accordion>
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
      // sx={(theme) => ({
      //   display: 'flex',
      //   alignItems: 'center',
      // })}
      >
        <Box
          sx={(theme) => ({
            display: 'flex',
            alignItems: 'center',
            flexDirection: 'row',
            [theme.breakpoints.down('md')]: {
              flexDirection: 'column',
              alignItems: 'flex-start',
            },
          })}
        >
          <Typography>📚 {source.title}</Typography>
          <Typography sx={(theme) => ({ ml: 2, [theme.breakpoints.down('md')]: { ml: 3 }, color: 'text.secondary' })}>{source.authors}</Typography>
        </Box>
      </AccordionSummary>
      <AccordionDetails>
        {source.publicationYear && (
          <Typography paragraph>{t('publishedIn')}: {source.publicationYear}</Typography>
        )}
        {source.providedBy ? (
          <Typography paragraph>
            {t('providedBy') + ': '}
            {source.providedByUrl ? (
              <Link href={source.providedByUrl} target="_blank" rel="noopener">
                {source.providedBy}
              </Link>
            ) : (
              <span>{source.providedBy}</span>
            )}
          </Typography>
        ) : null}
        {source.processedBy && <Typography paragraph>{t('processedBy')}: {source.processedBy}</Typography>}
        {source.copyright && (
          <Typography paragraph color="text.secondary">
            © {source.copyright}
          </Typography>
        )}
        {source.seeSourceURL && (
          <Typography paragraph>
            <Link href={source.seeSourceURL} target="_blank" rel="noopener">
              See original source
            </Link>
          </Typography>
        )}
        {source.description && (
          <div dangerouslySetInnerHTML={{ __html: contentHtml }} />
          // <Typography paragraph suppressHydrationWarning>
          //   <Markdown>{source.description.replaceAll('\\n', '\n\n')}</Markdown>
          // </Typography>
        )}
      </AccordionDetails>
    </Accordion>
  );
};

export default WrittenSourceAccordion;
