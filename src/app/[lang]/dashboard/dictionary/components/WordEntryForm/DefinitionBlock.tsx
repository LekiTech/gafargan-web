import { useState } from 'react';
import {
  DefinitionModel,
  DefinitionModelType,
  TranslationModel,
} from '@/dashboard/models/proposal.model';
import { WebsiteLang } from '@api/types.model';
import { useTranslation } from 'react-i18next';
import { Box, Typography, Chip, TextField, InputAdornment, IconButton } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import { BUTTON_PASTEL_COLORS_BLUE, INPUT_PASTEL_BEIGE } from './constants';
import { ExampleLine } from './ExampleLine';
import { TagSelector } from './TagSelector';

/* ---------------- DefinitionBlock ---------------- */
export const DefinitionBlock: React.FC<{
  idx: number;
  def: DefinitionModel;
  onChange: (d: DefinitionModel) => void;
  onDelete: () => void;
  tagEntries: Record<string, string>;
  allTags: [string, string][];
  wordLangDialectId: number;
  definitionsLangDialectId: number;
  lang: WebsiteLang;
  readonly: boolean;
}> = ({
  idx,
  def,
  onChange,
  onDelete,
  tagEntries,
  allTags,
  wordLangDialectId,
  definitionsLangDialectId,
  lang,
  readonly = false,
}) => {
  const { t } = useTranslation(lang);
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  const patch = (p: Partial<DefinitionModelType>) => onChange(def.merge(p));
  const deleteEx = (i: number) => {
    const defExamples = def.getExamples();
    if (defExamples && defExamples.length > 0) {
      patch({ examples: defExamples.filter((_, idx) => idx !== i) });
    }
  };
  return (
    <Box mt={1}>
      <Box display="flex" gap={1} alignItems="start">
        <Typography fontWeight={600} mt={'5px'}>
          {idx + 1}.
        </Typography>
        <Box
          gap={1}
          sx={(theme) => ({
            display: 'flex',
            flex: 1,
            flexDirection: 'row',
            alignItems: 'center',
            [theme.breakpoints.down('md')]: {
              flexDirection: 'column-reverse',
              alignItems: 'flex-start',
              gap: 1,
            },
          })}
        >
          {/* tags */}
          <Box
            display="flex"
            alignItems="baseline"
            gap={1}
            flexWrap="wrap"
            sx={(theme) => ({
              alignSelf: 'start',
              mt: '5px',
              [theme.breakpoints.down('md')]: { mt: '0', alignSelf: 'start' },
            })}
          >
            {def
              .getTags()
              ?.map((t) => (
                <Chip
                  key={t}
                  label={tagEntries[t.split(';')[0]]}
                  size="small"
                  onDelete={
                    readonly
                      ? undefined
                      : () => patch({ tags: def.getTags()?.filter((x) => x !== t) })
                  }
                />
              ))}
            {!readonly && (
              <>
                <Chip
                  label={t('addNewWord.tags', { ns: 'dashboard' })}
                  icon={<AddIcon />}
                  variant="filled"
                  size="small"
                  color="info"
                  sx={{
                    ...BUTTON_PASTEL_COLORS_BLUE,
                  }}
                  onClick={(e) => setAnchor(e.currentTarget)}
                />
                <TagSelector
                  anchorEl={anchor}
                  selected={def.getTags() ?? []}
                  onClose={() => setAnchor(null)}
                  onChange={(tags) => patch({ tags })}
                  allTags={allTags}
                  lang={lang}
                />
              </>
            )}
          </Box>
          <Box
            gap={1}
            sx={{
              display: 'flex',
              flex: 1,
              flexDirection: 'column',
              alignItems: 'flex-start',
              gap: 1,
            }}
          >
            {def.getValues().map((defVal, i) => (
              <TextField
                key={`${i}_def-value`}
                variant="standard"
                required={i === 0}
                placeholder={`${t('addNewWord.definition', { ns: 'dashboard' })}${i === 0 ? '*' : ''}`}
                slotProps={{
                  input: {
                    readOnly: readonly,
                    endAdornment: !readonly && def.getValues().length > 1 && (
                      <InputAdornment position="end">
                        <IconButton
                          size="small"
                          onClick={() => {
                            const updatedValues = def.getValues().filter((_, idx) => idx !== i);
                            def.setValues(updatedValues);
                            onChange(def);
                          }}
                          color="error"
                          edge="end"
                        >
                          <DeleteOutlineIcon fontSize="small" />
                        </IconButton>
                      </InputAdornment>
                    ),
                    // It works buggy on MUI, so skipping for now
                    // onInvalid: (e) =>
                    //   (e.target as HTMLInputElement).setCustomValidity('Definition cannot be empty'),
                  },
                }}
                sx={{ bgcolor: INPUT_PASTEL_BEIGE, '& .MuiInputBase-root': { pl: 1 } }}
                autoComplete="off"
                fullWidth
                value={defVal.value}
                onChange={(e) => {
                  const updatedValues = def.getValues();
                  updatedValues[i].value = e.target.value;
                  def.setValues(updatedValues);
                  onChange(def);
                }}
              />
            ))}
          </Box>
        </Box>
        {!readonly && (
          <>
            <IconButton
              size="small"
              onClick={() => {
                const updatedValues = def.getValues();
                updatedValues.push({ value: '' });
                def.setValues(updatedValues);
                onChange(def);
              }}
            >
              <AddIcon fontSize="small" />
            </IconButton>
            <IconButton size="small" onClick={onDelete} color="error">
              <DeleteOutlineIcon fontSize="small" />
            </IconButton>
          </>
        )}
      </Box>
      <Box sx={{ display: 'flex', flexDirection: 'column', ml: 2.5 }}>
        {def.getExamples()?.map((ex, i) => (
          <ExampleLine
            key={i}
            example={ex}
            isInnerBlockExample={true}
            onChange={(v) => {
              const copy = [...(def.getExamples() ?? [])];
              copy[i] = v;
              patch({ examples: copy });
            }}
            onDelete={() => deleteEx(i)}
            tagEntries={tagEntries}
            allTags={allTags}
            lang={lang}
            readonly={readonly}
          />
        ))}
        {!readonly && (
          <Chip
            label={t('addNewWord.example', { ns: 'dashboard' })}
            icon={<AddIcon />}
            variant="filled"
            size="small"
            color="info"
            sx={{
              width: 'fit-content',
              mt: 1.5,
              ...BUTTON_PASTEL_COLORS_BLUE,
            }}
            onClick={() =>
              patch({
                examples: [
                  ...(def.getExamples() ?? []),
                  TranslationModel.createEmpty([wordLangDialectId, definitionsLangDialectId]),
                ],
              })
            }
          />
        )}
      </Box>
    </Box>
  );
};
