'use client';
import React, { useEffect, useState } from 'react';
import { Accordion, AccordionSummary, AccordionDetails, Typography, Link } from '@mui/material';
import { remark } from 'remark';
import html from 'remark-html';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { WrittenSource } from '@api/types.model';

type WrittenSourceProps = {
  source: WrittenSource;
};

const WrittenSourceAccordion: React.FC<WrittenSourceProps> = ({ source }) => {
  const [contentHtml, setContentHtml] = useState('');
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
        aria-controls="panel1a-content"
        id="panel1a-header"
        sx={{ display: 'flex', alignItems: 'center' }}
      >
        <Typography>📚 {source.title}</Typography>
        <Typography sx={{ marginLeft: 2, color: 'text.secondary' }}>{source.authors}</Typography>
      </AccordionSummary>
      <AccordionDetails>
        {source.publicationYear && (
          <Typography paragraph>Published in {source.publicationYear}</Typography>
        )}
        {source.providedBy && source.providedByURL ? (
          <Typography paragraph>
            Provided by{' '}
            <Link href={source.providedByURL} target="_blank" rel="noopener">
              {source.providedBy}
            </Link>
          </Typography>
        ) : null}
        {source.processedBy && <Typography paragraph>Processed by {source.processedBy}</Typography>}
        {source.copyright && (
          <Typography paragraph color="text.secondary">
            © {source.copyright}
          </Typography>
        )}
        {source.description && (
          <div dangerouslySetInnerHTML={{ __html: contentHtml }} />
          // <Typography paragraph suppressHydrationWarning>
          //   <Markdown>{source.description.replaceAll('\\n', '\n\n')}</Markdown>
          // </Typography>
        )}
        {source.seeSourceURL && (
          <Typography paragraph>
            <Link href={source.seeSourceURL} target="_blank" rel="noopener">
              See original source
            </Link>
          </Typography>
        )}
      </AccordionDetails>
    </Accordion>
  );
};

export default WrittenSourceAccordion;
