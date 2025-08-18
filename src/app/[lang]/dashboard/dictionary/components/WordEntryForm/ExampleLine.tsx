import { useState } from 'react';
import { TranslationModel, TranslationModelType } from '@/dashboard/models/proposal.model';
import { WebsiteLang } from '@api/types.model';
import { LangDialects } from '@repository/constants';
import { useTranslation } from 'react-i18next';
import { langDialectIdToString } from '@/dashboard/utils';
import { Box, IconButton, Chip, Select, MenuItem, TextField, InputAdornment } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import { BUTTON_PASTEL_COLORS_BLUE } from './constants';
import { TagSelector } from './TagSelector';

/* ---------------- ExampleLine ---------------- */
export const ExampleLine: React.FC<{
  example: TranslationModel;
  onChange: (v: TranslationModel) => void;
  onDelete: () => void;
  isInnerBlockExample: boolean;
  tagEntries: Record<string, string>;
  allTags: [string, string][];
  lang: WebsiteLang;
  readonly: boolean;
}> = ({
  example,
  onChange,
  onDelete,
  isInnerBlockExample,
  tagEntries,
  allTags,
  lang,
  readonly = false,
}) => {
  const { t } = useTranslation(lang);
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  // const [mouseHovering, setMouseHovering] = useState(false);
  const patch = (p: Partial<TranslationModelType>) => onChange(example.merge(p));
  const getRemainingLangDialectIds = (options?: { includeId: string }) =>
    Object.entries(LangDialects).filter(([id, name]) => {
      return (
        (options && options.includeId === id) ||
        example.getAllLangDialectIds().indexOf(parseInt(id)) === -1
      );
    });
  return (
    <Box
      display="flex"
      alignItems="baseline"
      gap={2}
      mt={0.5}
      mb={0.5}
      ml={0.5}
      pl={1.5}
      flex={1}
      borderLeft="3px solid rgba(0,0,0,0.15)"
      // onMouseEnter={() => setMouseHovering(true)}
      // onMouseLeave={() => setMouseHovering(false)}
    >
      {/* <Typography color="text.secondary">●</Typography> */}
      <Box
        gap={1}
        sx={{
          display: 'flex',
          flex: 1,
          // flexDirection: 'row',
          // alignItems: 'center',
          flexDirection: 'column',
          alignItems: 'flex-start',
          gap: 1,
        }}
      >
        {!readonly && (
          <IconButton
            size="small"
            onClick={onDelete}
            sx={(theme) => ({
              alignSelf: 'flex-start',
              // visibility: mouseHovering ? undefined : 'hidden',
            })}
            color="error"
          >
            <DeleteOutlineIcon fontSize="small" />
          </IconButton>
        )}
        {/* tags */}
        <Box display="flex" gap={1} flexWrap="wrap">
          {example
            .getTags()
            ?.map((t) => (
              <Chip
                key={t}
                label={tagEntries[t.split(';')[0]]}
                size="small"
                onDelete={
                  readonly
                    ? undefined
                    : () => patch({ tags: example.getTags()?.filter((x) => x !== t) })
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
                selected={example.getTags() ?? []}
                onClose={() => setAnchor(null)}
                onChange={(tags) => patch({ tags })}
                allTags={allTags}
                lang={lang}
              />
            </>
          )}
        </Box>
        {example.getAllLangDialectIds().map((langDialectId, i) => (
          <Box
            key={`ld_${langDialectId}_i_${i}`}
            sx={{
              display: 'flex',
              flex: 1,
              width: '100%',
              flexDirection: 'row',
              alignItems: 'start',
              gap: 2,
            }}
          >
            <Select
              size="small"
              variant="standard"
              value={langDialectId}
              sx={(theme) => ({
                flex: 1,
                fontSize: '0.875rem',
                color: theme.palette.text.secondary,
                minWidth: 150,
                maxWidth: 150,
                mt: 1,
              })}
              onChange={(e) => {
                const phrasesToMove = example.getPhrasesByLangDialect(langDialectId);
                const newLangDialectId = e.target.value;
                example.setPhrasesByLangDialect(newLangDialectId, phrasesToMove ?? []);
                example.deletePhrasesForLangDialect(langDialectId);
                onChange(example);
              }}
              inputProps={{ readOnly: readonly }}
            >
              {getRemainingLangDialectIds({ includeId: langDialectId.toString() }).map(
                ([id, name]) => (
                  <MenuItem key={id} value={id}>
                    {langDialectIdToString(parseInt(id), t)}
                  </MenuItem>
                ),
              )}
            </Select>
            <Box
              sx={{
                display: 'flex',
                flex: 1,
                width: '100%',
                flexDirection: 'column',
                gap: 1,
                mb: 1,
              }}
            >
              {example.getPhrasesByLangDialect(langDialectId)?.map((phrase, i) => (
                <TextField
                  key={`ld_${langDialectId}_phrase_i_${i}`}
                  variant="standard"
                  fullWidth
                  value={phrase.phrase}
                  onChange={(e) => {
                    const updatedPhrases = example.getPhrasesByLangDialect(langDialectId)!;
                    updatedPhrases[i].phrase = e.target.value;
                    example.setPhrasesByLangDialect(langDialectId, updatedPhrases);
                    onChange(example);
                  }}
                  placeholder={t('addNewWord.example', { ns: 'dashboard' })}
                  autoComplete="off"
                  slotProps={{
                    input: {
                      disableUnderline: true,
                      readOnly: readonly,
                      style: { borderBottom: '1px dashed #000' },
                      endAdornment: !readonly &&
                        example.getPhrasesByLangDialect(langDialectId)!.length > 1 && (
                          <InputAdornment position="end">
                            <IconButton
                              size="small"
                              onClick={() => {
                                const currentPhrases =
                                  example.getPhrasesByLangDialect(langDialectId)!;
                                if (currentPhrases.length === 1) {
                                  return;
                                }
                                example.setPhrasesByLangDialect(
                                  langDialectId,
                                  currentPhrases.filter((_, idx) => idx !== i),
                                );
                                onChange(example);
                              }}
                              color="error"
                              edge="end"
                            >
                              <DeleteOutlineIcon fontSize="small" />
                            </IconButton>
                          </InputAdornment>
                        ),
                    },
                  }}
                />
              ))}
            </Box>
            {!readonly && (
              <>
                <IconButton
                  size="small"
                  onClick={() => {
                    const currentPhrases = example.getPhrasesByLangDialect(langDialectId)!;
                    example.setPhrasesByLangDialect(langDialectId, [
                      ...currentPhrases,
                      { phrase: '' },
                    ]);
                    onChange(example);
                  }}
                >
                  <AddIcon fontSize="small" />
                </IconButton>
                <IconButton
                  size="small"
                  onClick={() => {
                    if (example.getAllLangDialectIds().length === 1) {
                      onDelete();
                      return;
                    }
                    example.deletePhrasesForLangDialect(langDialectId);
                    onChange(example);
                  }}
                  color="error"
                >
                  <DeleteOutlineIcon fontSize="small" />
                </IconButton>
              </>
            )}
          </Box>
        ))}
        {!readonly && (
          <Box
            sx={{
              display: 'flex',
              flex: 1,
              width: '100%',
              flexDirection: 'row',
              alignItems: 'center',
              // justifyContent: 'space-between',
              gap: 2,
            }}
          >
            {getRemainingLangDialectIds().length > 0 && (
              <Chip
                label={t('addNewWord.languageDialect', { ns: 'dashboard' })}
                icon={<AddIcon />}
                variant="filled"
                size="small"
                color="info"
                sx={{
                  ...BUTTON_PASTEL_COLORS_BLUE,
                }}
                onClick={() => {
                  const remainingLangDialects = getRemainingLangDialectIds();
                  const newLangDialectId = parseInt(remainingLangDialects[0][0]);
                  example.setPhrasesByLangDialect(newLangDialectId, [{ phrase: '' }]);
                  onChange(example);
                }}
              />
            )}
          </Box>
        )}
      </Box>
    </Box>
  );
};
