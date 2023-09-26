import React, { FC, use } from 'react';
import expressionApi from '@/api/expression';
import { ExpressionDetails, WebsiteLang } from '@/api/types';
import { Box, Chip, Stack, Typography } from '@mui/material';
import { useTranslation } from '@i18n/index';
import { expressionFont, lusitanaFont } from '@/fonts';
import { DefinitionDetailsComp } from './DefinitionComp';
import { createSpellingId } from '../utils';

function expressionSpellingToLowerCase(spelling: string) {
  return spelling.toLowerCase().replaceAll('i', 'I');
}
type ExpressionDetailsCompProps = {
  idx: number;
  lang: WebsiteLang;
  spelling: string;
  data: ExpressionDetails;
};

const ExpressionDetailsComp: FC<ExpressionDetailsCompProps> = async ({
  idx,
  lang,
  spelling,
  data,
}) => {
  const { t } = await useTranslation(lang, 'tags');
  return (
    <Stack
      // spacing={4}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'left',
        justifyContent: 'center',
        // width: '100vw',
        // pt: '25px',
        // pl: '25px',
      }}
    >
      <Typography
        variant="h2"
        className={expressionFont.className}
        id={createSpellingId(idx, spelling, data.definitionDetails.length, data.inflection)}
      >
        {expressionSpellingToLowerCase(spelling)}
      </Typography>
      <Typography variant="h6" color="text.secondary" sx={{ mb: '50px' }}>
        {data.inflection}
      </Typography>

      {data.definitionDetails.map((dd, i) => (
        <DefinitionDetailsComp
          key={`exp_det_${i}`}
          idx={i}
          definitionDetails={dd}
          lang={lang}
          spelling={spelling}
          inflection={data.inflection}
        />
        // borderLeft: '1px solid grey',
        // <Stack key={`exp_det_${i}`} sx={{ position: 'relative', pl: '35px' }}>
        //   <Typography
        //     variant="h6"
        //     key={`exp_det_${i}_def_num_${i}`}
        //     sx={{ position: 'absolute', left: '0' }}
        //   >
        //     {i + 1}
        //   </Typography>
        //   <DefinitionsGroup
        //     idx={i}
        //     lang={lang}
        //     definitions={dd.definitions}
        //     examples={dd.examples}
        //     tags={dd.tags}
        //     spelling={spelling}
        //     inflection={data.inflection}
        //   />
        //   {/* {dd.definitions.map((d, j) => (
        //     <DefinitionComp key={`${i}_${j}`} definition={d} lang={lang} />
        //     // <>
        //     //   <Typography variant="body1" key={`exp_det_${i}_def_${d.value}`}>
        //     //     {d.value}
        //     //   </Typography>
        //     //   {/* {d.tags != undefined && (
        //     //     <Box sx={{ display: 'flex', flexWrap: 'wrap' }}>
        //     //       d.tags.map((tag, t_i) => (
        //     //         <Chip key={`exp_det_${i}_tags_${tag}_${t_i}`} label={t(tag)} />
        //     //       )
        //     //     </Box>
        //     //     )
        //     //   } * /}
        //     //   {d.tags?.map((tag, t_i) => (
        //     //     <Chip
        //     //       key={`exp_det_${i}_tags_${tag}_${t_i}`}
        //     //       sx={{ maxWidth: '250px', width: 'wrap-content' }}
        //     //       label={t(tag)}
        //     //     />
        //     //   ))}
        //     // </>
        //   ))} */}
        // </Stack>
      ))}

      {/* <pre style={{ width: '100%' }}>
        {/* {data.definitionDetails
          .map((dd) => [...dd.definitions.map((d) => d.tags).flat(), ...(dd.tags ?? [])])
          .flat()
          .filter((tag) => tag != undefined && tag !== 'см.тж.' && tag !== 'см.')
          .map((tag) => t(tag!))
          .join(', ')} * /}
        {data.definitionDetails
          .map((dd) => ({ defCount: dd.definitions.length, exCount: dd.examples?.length ?? 0 }))
          .map(({ defCount, exCount }) =>
            exCount > 0
              ? `\t- definition (${defCount})\n\t  examples (${exCount})`
              : `\t- definition (${defCount})`,
          )
          .join('\n\n')}
        {data.examples ? `\n\n\tgeneric examples (${data.examples.length})` : ''}
      </pre>
      <pre style={{ width: '100%' }}>
        {/* <Typography variant="h6" color="blueviolet"> * /}
        {`
        1. кьил (-и, -е, -ери)
              - definition (1)
                examples (1)

              - definition (2)
                examples (4)

              - definition (1)
                examples (3)

              - definition (3)
                examples (3)

              - definition (3)
                examples (1)

              - definition (2)
                examples (7)

              - definition (2)
                examples (2)

              - definition (1)
                examples (3)

              - definition (4)
                examples (4)

              - definition (2)
                examples (4)

              - definition (2)
                examples (2)
              
              - generic examples (138)
          2. кьил (-и, -е, -ери)

              - definition (1)
              
              - generic examples (1)`}
        {/* </Typography> * /}
      </pre>
      <Typography variant="h6">Definitions</Typography>
      <pre style={{ width: '100%' }}>
        <code>{JSON.stringify(data.definitionDetails, null, 2)}</code>
      </pre>
      <Typography variant="h6">Examples</Typography>
      <pre style={{ width: '100%' }}>
        <code>{JSON.stringify(data.examples, null, 2)}</code>
      </pre>
      <br /> */}
    </Stack>
  );
};

export default ExpressionDetailsComp;
