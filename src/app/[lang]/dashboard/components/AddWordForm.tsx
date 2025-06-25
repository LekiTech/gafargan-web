/*
  Re‑implementation of the original shadcn-based AddWordForm using Material‑UI (MUI v5).
  All functionality has been preserved. This file is written in TSX.
*/

'use client';

import React, { useState, KeyboardEvent, FC } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Collapse,
  Grid,
  IconButton,
  MenuItem,
  Select,
  TextField,
  Typography,
  Chip,
  Badge as MuiBadge,
  Stack,
  FormControl,
  InputLabel,
  OutlinedInput,
  SelectChangeEvent,
  useTheme,
  Theme,
} from '@mui/material';
import {
  Save as SaveIcon,
  Close as CloseIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import { Source, SpellingVariant, WordDetail } from './tempWordTypes';

// Form state interfaces for easier handling
export interface WordFormData {
  spelling: string;
  lang: number;
  source?: Source;
  spellingVariants: Omit<SpellingVariant, 'id'>[];
  details: Omit<WordDetail, 'id'>[];
}

// -----------------------------------------------------------------------------
// Static data -----------------------------------------------------------------
// -----------------------------------------------------------------------------

const languages = [
  { id: 1, name: 'English', code: 'en' },
  { id: 2, name: 'Spanish', code: 'es' },
  { id: 3, name: 'French', code: 'fr' },
  { id: 4, name: 'German', code: 'de' },
  { id: 5, name: 'Italian', code: 'it' },
];

const commonSources: Source[] = [
  { id: 1, name: 'Dictionary.com' },
  { id: 2, name: 'Merriam‑Webster' },
  { id: 3, name: 'Oxford Dictionary' },
  { id: 4, name: 'Personal Knowledge' },
];

const commonTags = [
  'noun',
  'verb',
  'adjective',
  'adverb',
  'formal',
  'informal',
  'slang',
  'archaic',
  'technical',
  'colloquial',
  'literary',
];
const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
};

function getStyles(name: string, personName: readonly string[], theme: Theme) {
  return {
    fontWeight: personName.includes(name)
      ? theme.typography.fontWeightMedium
      : theme.typography.fontWeightRegular,
  };
}

// -----------------------------------------------------------------------------
// Component -------------------------------------------------------------------
// -----------------------------------------------------------------------------

export const AddWordForm: FC<{
  onSave?: (word: WordFormData) => void;
  onCancel?: () => void;
}> = ({ onSave = () => {}, onCancel = () => {} }) => {
  const theme = useTheme();
  // const { t, i18n } = useTranslation(searchLang.from);
  // ────────────────────────────────────────────────────────────────────────────
  // Local state ----------------------------------------------------------------
  // ────────────────────────────────────────────────────────────────────────────

  const [formData, setFormData] = useState<WordFormData>({
    spelling: '',
    lang: 1,
    source: undefined,
    spellingVariants: [],
    details: [
      {
        orderIdx: 1,
        inflection: null,
        lang: 2, // default translation language (Spanish)
        source: null,
        definitions: [
          {
            id: -1,
            values: [{ value: '' }],
            tags: [],
            examples: [],
          },
        ],
        examples: [],
      },
    ],
  });

  // Collapsible sections -------------------------------------------------------
  const [showVariants, setShowVariants] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showSource, setShowSource] = useState(false);

  // Other local UI state -------------------------------------------------------
  const [newVariant, setNewVariant] = useState('');
  const [selectedTags, setSelectedTags] = React.useState<string[]>([]);
  const handleChange = (event: SelectChangeEvent<typeof selectedTags>) => {
    const {
      target: { value },
    } = event;
    setSelectedTags(
      // On autofill we get a stringified value.
      typeof value === 'string' ? value.split(',') : value,
    );
  };

  // ────────────────────────────────────────────────────────────────────────────
  // Helpers --------------------------------------------------------------------
  // ────────────────────────────────────────────────────────────────────────────

  const isBasicFormValid = () =>
    formData.spelling.trim().length > 0 &&
    formData.details[0]?.definitions[0]?.values[0]?.value.trim().length > 0;

  const addSpellingVariant = () => {
    if (!newVariant.trim()) return;
    setFormData((prev) => ({
      ...prev,
      spellingVariants: [
        ...prev.spellingVariants,
        { spelling: newVariant.trim(), lang: prev.lang, source: null },
      ],
    }));
    setNewVariant('');
  };

  const removeSpellingVariant = (idx: number) => {
    setFormData((prev) => ({
      ...prev,
      spellingVariants: prev.spellingVariants.filter((_, i) => i !== idx),
    }));
  };

  const updateDefinitionValue = (value: string) => {
    setFormData((prev) => {
      const detailsCopy = [...prev.details];
      detailsCopy[0].definitions[0].values[0].value = value;
      return { ...prev, details: detailsCopy };
    });
  };

  const toggleTag = (tag: string) => {
    setFormData((prev) => {
      const detailsCopy = [...prev.details];
      const tags = detailsCopy[0].definitions[0].tags;
      detailsCopy[0].definitions[0].tags = tags.includes(tag)
        ? tags.filter((t) => t !== tag)
        : [...tags, tag];
      return { ...prev, details: detailsCopy };
    });
  };

  const handleSave = () => {
    if (isBasicFormValid()) onSave(formData);
  };

  // ────────────────────────────────────────────────────────────────────────────
  // Render ---------------------------------------------------------------------
  // ────────────────────────────────────────────────────────────────────────────

  return (
    <Box
      sx={{
        mx: 'auto',
        maxWidth: 600,
        bgcolor: 'background.paper',
        minHeight: '100vh',
      }}
    >
      {/* Main content --------------------------------------------------------- */}
      <Box p={2} display="flex" flexDirection="column" gap={3}>
        {/* Basic form */}
        <Card>
          <CardContent>
            <Grid container spacing={2} mb={2}>
              <Grid size={{ xs: 6 }}>
                <Typography variant="subtitle2" mb={0.5}>
                  From
                </Typography>
                <Select
                  fullWidth
                  size="small"
                  value={formData.lang}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, lang: Number(e.target.value) }))
                  }
                >
                  {languages.map((lang) => (
                    <MenuItem key={lang.id} value={lang.id}>
                      {lang.name}
                    </MenuItem>
                  ))}
                </Select>
              </Grid>
              <Grid size={{ xs: 6 }}>
                <Typography variant="subtitle2" mb={0.5}>
                  To
                </Typography>
                <Select
                  fullWidth
                  size="small"
                  value={formData.details[0].lang}
                  onChange={(e) => {
                    setFormData((prev) => {
                      const detailsCopy = [...prev.details];
                      detailsCopy[0].lang = Number(e.target.value);
                      return { ...prev, details: detailsCopy };
                    });
                  }}
                >
                  {languages.map((lang) => (
                    <MenuItem key={lang.id} value={lang.id}>
                      {lang.name}
                    </MenuItem>
                  ))}
                </Select>
              </Grid>
            </Grid>

            <Box mb={2}>
              <Typography variant="subtitle2" mb={0.5}>
                Word ({languages.find((l) => l.id === formData.lang)?.name})
              </Typography>
              <TextField
                fullWidth
                size="small"
                value={formData.spelling}
                onChange={(e) => setFormData((prev) => ({ ...prev, spelling: e.target.value }))}
                placeholder="Enter word…"
                autoFocus
              />
            </Box>

            <Box>
              <Typography variant="subtitle2" mb={0.5}>
                Translation ({languages.find((l) => l.id === formData.details[0].lang)?.name})
              </Typography>
              <Stack direction="row">
                <TextField
                  fullWidth
                  size="small"
                  multiline
                  minRows={3}
                  value={formData.details[0].definitions[0].values[0].value}
                  onChange={(e) => updateDefinitionValue(e.target.value)}
                  placeholder="Enter translation…"
                />
                <FormControl sx={{ m: 1, width: 300 }}>
                  <InputLabel id="demo-multiple-chip-label">Tags</InputLabel>
                  <Select
                    multiple
                    value={selectedTags}
                    onChange={handleChange}
                    input={<OutlinedInput id="select-multiple-chip" label="Tags" />}
                    renderValue={(selected) => (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {selected.map((value) => (
                          <Chip key={value} label={value} />
                        ))}
                      </Box>
                    )}
                    MenuProps={MenuProps}
                  >
                    {commonTags.map((tag) => (
                      <MenuItem key={tag} value={tag} style={getStyles(tag, selectedTags, theme)}>
                        {tag}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Stack>
            </Box>
          </CardContent>
        </Card>

        {/* Source ---------------------------------------------------------------*/}
        <Card>
          <CardHeader
            title={
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography variant="subtitle2">Source</Typography>
                <Box display="flex" alignItems="center" gap={1}>
                  {formData.source && (
                    <Chip label={formData.source.name} size="small" color="secondary" />
                  )}
                  {showSource ? (
                    <ExpandLessIcon fontSize="small" />
                  ) : (
                    <ExpandMoreIcon fontSize="small" />
                  )}
                </Box>
              </Box>
            }
            sx={{ cursor: 'pointer', ':hover': { bgcolor: 'action.hover' } }}
            onClick={() => setShowSource((p) => !p)}
          />
          <Collapse in={showSource} timeout="auto" unmountOnExit>
            <CardContent sx={{ pt: 0 }}>
              <Select
                fullWidth
                size="small"
                displayEmpty
                value={formData.source?.id ?? ''}
                onChange={(e) => {
                  const val = e.target.value as number | '';
                  const src = commonSources.find((s) => s.id === val);
                  setFormData((prev) => ({ ...prev, source: src }));
                }}
              >
                <MenuItem value="">
                  <em>Select a source…</em>
                </MenuItem>
                {commonSources.map((s) => (
                  <MenuItem key={s.id} value={s.id}>
                    {s.name}
                  </MenuItem>
                ))}
              </Select>
            </CardContent>
          </Collapse>
        </Card>

        {/* Quick tags */}
        {/* <Card>
          <CardContent>
            <Typography variant="subtitle2" mb={1.5}>
              Quick Tags (Optional)
            </Typography>
            <Box display="flex" flexWrap="wrap" gap={1}>
              {commonTags.slice(0, 6).map((tag) => {
                const selected = formData.details[0].definitions[0].tags.includes(tag);
                return (
                  <Chip
                    key={tag}
                    label={tag}
                    size="small"
                    color={selected ? 'primary' : undefined}
                    variant={selected ? 'filled' : 'outlined'}
                    onClick={() => toggleTag(tag)}
                    sx={{ cursor: 'pointer' }}
                  />
                );
              })}
            </Box>
          </CardContent>
        </Card> */}

        {/* Alternative Spellings ------------------------------------------------*/}
        <Card>
          <CardHeader
            title={
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography variant="subtitle2">Alternative Spellings</Typography>
                <Box display="flex" alignItems="center" gap={1}>
                  {formData.spellingVariants.length > 0 && (
                    <MuiBadge
                      badgeContent={formData.spellingVariants.length}
                      color="secondary"
                      sx={{ mr: 0.5 }}
                    />
                  )}
                  {showVariants ? (
                    <ExpandLessIcon fontSize="small" />
                  ) : (
                    <ExpandMoreIcon fontSize="small" />
                  )}
                </Box>
              </Box>
            }
            sx={{ cursor: 'pointer', ':hover': { bgcolor: 'action.hover' } }}
            onClick={() => setShowVariants((p) => !p)}
          />
          <Collapse in={showVariants} timeout="auto" unmountOnExit>
            <CardContent sx={{ pt: 0 }}>
              <Box display="flex" gap={1} mb={2}>
                <TextField
                  fullWidth
                  size="small"
                  value={newVariant}
                  placeholder="Alternative spelling…"
                  onChange={(e) => setNewVariant(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addSpellingVariant()}
                />
                <Button
                  variant="contained"
                  size="small"
                  disabled={!newVariant.trim()}
                  onClick={addSpellingVariant}
                >
                  <AddIcon fontSize="small" />
                </Button>
              </Box>

              {formData.spellingVariants.map((variant, i) => (
                <Box
                  key={`${variant.spelling}-${i}`}
                  display="flex"
                  alignItems="center"
                  justifyContent="space-between"
                  p={1}
                  mb={1}
                  sx={{ bgcolor: 'grey.100', borderRadius: 1 }}
                >
                  <Typography variant="body2">{variant.spelling}</Typography>
                  <IconButton
                    size="small"
                    onClick={() => removeSpellingVariant(i)}
                    aria-label="remove variant"
                  >
                    <CloseIcon fontSize="inherit" />
                  </IconButton>
                </Box>
              ))}
            </CardContent>
          </Collapse>
        </Card>

        {/* Advanced options ----------------------------------------------------*/}
        <Card>
          <CardHeader
            title={
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography variant="subtitle2">More Tags & Options</Typography>
                {showAdvanced ? (
                  <ExpandLessIcon fontSize="small" />
                ) : (
                  <ExpandMoreIcon fontSize="small" />
                )}
              </Box>
            }
            sx={{ cursor: 'pointer', ':hover': { bgcolor: 'action.hover' } }}
            onClick={() => setShowAdvanced((p) => !p)}
          />
          <Collapse in={showAdvanced} timeout="auto" unmountOnExit>
            <CardContent sx={{ pt: 0 }}>
              {/* All tags */}
              <Box mb={2}>
                <Typography variant="subtitle2" mb={1}>
                  All Tags
                </Typography>
                <Box display="flex" flexWrap="wrap" gap={1}>
                  {commonTags.map((tag) => {
                    const selected = formData.details[0].definitions[0].tags.includes(tag);
                    return (
                      <Chip
                        key={tag}
                        label={tag}
                        size="small"
                        color={selected ? 'primary' : undefined}
                        variant={selected ? 'filled' : 'outlined'}
                        onClick={() => toggleTag(tag)}
                        sx={{ cursor: 'pointer' }}
                      />
                    );
                  })}
                </Box>
              </Box>

              {/* Inflection */}
              <Box>
                <Typography variant="subtitle2" mb={0.5}>
                  Inflection (Optional)
                </Typography>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="e.g., past tense, plural…"
                  value={formData.details[0].inflection ?? ''}
                  onChange={(e) => {
                    setFormData((prev) => {
                      const detailsCopy = [...prev.details];
                      detailsCopy[0].inflection = e.target.value || null;
                      return { ...prev, details: detailsCopy };
                    });
                  }}
                />
              </Box>
            </CardContent>
          </Collapse>
        </Card>

        {/* Bottom save button --------------------------------------------------*/}
        <Box pb={4}>
          <Button
            variant="contained"
            fullWidth
            size="large"
            startIcon={<SaveIcon />}
            disabled={!isBasicFormValid()}
            onClick={handleSave}
          >
            Save Word
          </Button>
          {isBasicFormValid() && (
            <Typography
              variant="caption"
              color="text.secondary"
              textAlign="center"
              display="block"
              mt={1}
            >
              Ready to save! All other fields are optional.
            </Typography>
          )}
        </Box>
      </Box>
    </Box>
  );
};
