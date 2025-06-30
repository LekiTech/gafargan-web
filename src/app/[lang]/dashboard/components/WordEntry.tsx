'use client';
import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  TextField,
  IconButton,
  Button,
  Collapse,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  Autocomplete,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';

// ----- types -----------------------------------------------------------

interface Definition {
  values: string[];
  tags: string[];
  examples: string[];
}

interface WordDetail {
  dialect: string;
  inflection?: string;
  tags: string[];
  definitions: Definition[];
}

interface Entry {
  spelling: string;
  quickDef: string; // for collapsed state only
  expanded: boolean;
  wordDetails: WordDetail[]; // always length 1 for this UI
}

// ----- constants -------------------------------------------------------

const LANG_DIALECTS = [
  { code: 'EN_US', label: 'English (US)' },
  { code: 'EN_GB', label: 'English (UK)' },
  { code: 'FR_FR', label: 'French (FR)' },
];
const SOURCES = ['Book X, 1992', 'Corpus Y'];
const DIALECTS = ['', 'UK', 'US', 'CA'];
const TAGS = ['noun', 'verb', 'adj', 'formal', 'archaic'];

// ----- helpers ---------------------------------------------------------

function buildJSON(state: { langFrom: string; langTo: string; source: string; entries: Entry[] }) {
  const entries = state.entries.map((e) => {
    if (!e.spelling) return null;

    // build wordDetails
    let wd = e.wordDetails[0];
    if (!e.expanded) {
      // collapsed: create minimal detail with quickDef
      wd = {
        dialect: '',
        tags: [],
        definitions: [
          {
            values: [e.quickDef].filter(Boolean),
            tags: [],
            examples: [],
          },
        ],
      };
    }

    return {
      spelling: e.spelling,
      wordDetails: [wd],
    };
  });
  return JSON.stringify(
    {
      langDialectFrom: state.langFrom,
      langDialectTo: state.langTo,
      source: state.source,
      entries: entries.filter(Boolean),
    },
    null,
    2,
  );
}

// ----- component -------------------------------------------------------

export const WordEntry: React.FC = () => {
  const [langFrom, setLangFrom] = useState('EN_US');
  const [langTo, setLangTo] = useState('FR_FR');
  const [source, setSource] = useState('Book X, 1992');
  const [entries, setEntries] = useState<Entry[]>([]);

  const addRow = () => {
    setEntries((prev) => [
      ...prev,
      {
        spelling: '',
        quickDef: '',
        expanded: false,
        wordDetails: [
          {
            dialect: '',
            inflection: '',
            tags: [],
            definitions: [],
          },
        ],
      },
    ]);
  };

  const removeRow = (idx: number) => {
    setEntries((prev) => prev.filter((_, i) => i !== idx));
  };

  const toggleExpand = (idx: number) => {
    setEntries((prev) =>
      prev.map((e, i) =>
        i === idx
          ? {
              ...e,
              expanded: !e.expanded,
              // seed first definition when expanding
              wordDetails:
                !e.expanded && e.quickDef
                  ? [
                      {
                        dialect: '',
                        inflection: '',
                        tags: [],
                        definitions: [
                          {
                            values: [e.quickDef],
                            tags: [],
                            examples: [],
                          },
                        ],
                      },
                    ]
                  : e.wordDetails,
            }
          : e,
      ),
    );
  };

  // handlers for dynamic fields ------------------------------------------------
  const updateEntry = (idx: number, patch: Partial<Entry>) => {
    setEntries((prev) => prev.map((e, i) => (i === idx ? { ...e, ...patch } : e)));
  };

  const updateDetail = (row: number, patch: Partial<WordDetail>) => {
    setEntries((prev) =>
      prev.map((e, i) =>
        i === row
          ? {
              ...e,
              wordDetails: [{ ...e.wordDetails[0], ...patch }],
            }
          : e,
      ),
    );
  };

  const addDefinition = (row: number) => {
    setEntries((prev) =>
      prev.map((e, i) => {
        if (i !== row) return e;
        return {
          ...e,
          wordDetails: [
            {
              ...e.wordDetails[0],
              definitions: [
                ...e.wordDetails[0].definitions,
                { values: [''], tags: [], examples: [] },
              ],
            },
          ],
        };
      }),
    );
  };

  const updateDefinition = (row: number, defIdx: number, patch: Partial<Definition>) => {
    setEntries((prev) =>
      prev.map((e, i) => {
        if (i !== row) return e;
        const defs = e.wordDetails[0].definitions.map((d, j) =>
          j === defIdx ? { ...d, ...patch } : d,
        );
        return {
          ...e,
          wordDetails: [{ ...e.wordDetails[0], definitions: defs }],
        };
      }),
    );
  };

  const removeDefinition = (row: number, defIdx: number) => {
    setEntries((prev) =>
      prev.map((e, i) => {
        if (i !== row) return e;
        const defs = e.wordDetails[0].definitions.filter((d, j) => j !== defIdx);
        return {
          ...e,
          wordDetails: [{ ...e.wordDetails[0], definitions: defs }],
        };
      }),
    );
  };

  return (
    <Box sx={{ maxWidth: 1000, width: 1000, mx: 'auto', p: 2 }}>
      {/* global selectors */}
      <Paper sx={{ p: 3, mb: 4 }} elevation={3}>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 4 }}>
            <FormControl fullWidth size="small">
              <InputLabel id="lang-from">LangDialect From</InputLabel>
              <Select
                labelId="lang-from"
                value={langFrom}
                label="LangDialect From"
                onChange={(e) => setLangFrom(e.target.value)}
              >
                {LANG_DIALECTS.map((l) => (
                  <MenuItem key={l.code} value={l.code}>
                    {l.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <FormControl fullWidth size="small">
              <InputLabel id="lang-to">LangDialect To</InputLabel>
              <Select
                labelId="lang-to"
                value={langTo}
                label="LangDialect To"
                onChange={(e) => setLangTo(e.target.value)}
              >
                {LANG_DIALECTS.map((l) => (
                  <MenuItem key={l.code} value={l.code}>
                    {l.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <FormControl fullWidth size="small">
              <InputLabel id="source">Source</InputLabel>
              <Select
                labelId="source"
                value={source}
                label="Source"
                onChange={(e) => setSource(e.target.value)}
              >
                {SOURCES.map((s) => (
                  <MenuItem key={s} value={s}>
                    {s}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>

      {/* entry rows */}
      {entries.map((entry, idx) => (
        <Paper key={idx} sx={{ position: 'relative', p: 2, mb: 2 }} elevation={1}>
          <Grid container spacing={2} alignItems="flex-end">
            <Grid size={{ xs: 12, md: entry.expanded ? 11 : 5 }}>
              <TextField
                label="Spelling"
                fullWidth
                size="small"
                value={entry.spelling}
                onChange={(e) => updateEntry(idx, { spelling: e.target.value })}
              />
            </Grid>
            {!entry.expanded && (
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  label="Definition / translation"
                  fullWidth
                  size="small"
                  value={entry.quickDef}
                  onChange={(e) => updateEntry(idx, { quickDef: e.target.value })}
                />
              </Grid>
            )}
            <Grid size={{ xs: 12, md: 1 }} textAlign="end">
              <IconButton color="error" onClick={() => removeRow(idx)}>
                <DeleteIcon />
              </IconButton>
            </Grid>
            <Grid size={{ xs: 12 }} textAlign="center">
              <IconButton
                color="primary"
                onClick={() => toggleExpand(idx)}
                sx={{ position: 'absolute', bottom: '-3px' }}
              >
                {entry.expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              </IconButton>
            </Grid>
          </Grid>

          {/* expanded detail */}
          <Collapse in={entry.expanded} timeout="auto" unmountOnExit>
            <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Autocomplete
                    multiple
                    sx={{ height: '100%' }}
                    options={TAGS}
                    value={entry.wordDetails[0].tags}
                    onChange={(_, v) => updateDetail(idx, { tags: v })}
                    renderInput={(params) => <TextField {...params} label="Tags" size="small" />}
                  />
                </Grid>
                {/* <Grid size={{ xs: 12, md: 4 }}>
                  <FormControl fullWidth size="small">
                    <InputLabel id={`dialect-${idx}`}>Dialect</InputLabel>
                    <Select
                      labelId={`dialect-${idx}`}
                      value={entry.wordDetails[0].dialect}
                      label="Dialect"
                      onChange={(e) => updateDetail(idx, { dialect: e.target.value })}
                    >
                      {DIALECTS.map((d) => (
                        <MenuItem key={d} value={d}>
                          {d || '—'}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid> */}
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    label="Inflection"
                    size="small"
                    fullWidth
                    value={entry.wordDetails[0].inflection || ''}
                    onChange={(e) => updateDetail(idx, { inflection: e.target.value })}
                  />
                </Grid>
              </Grid>

              {/* definitions list */}
              {entry.wordDetails[0].definitions.map((def, dIdx) => (
                <Paper key={dIdx} sx={{ p: 2, mt: 2 }} variant="outlined">
                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <TextField
                        label="Definition"
                        fullWidth
                        multiline
                        // minRows={2}
                        value={def.values.join('\n')}
                        onChange={(e) =>
                          updateDefinition(idx, dIdx, {
                            values: e.target.value.split('\n').map((v) => v.trim()),
                          })
                        }
                      />
                    </Grid>
                    <Grid size={{ xs: 12, md: 5 }}>
                      <Autocomplete
                        multiple
                        options={TAGS}
                        value={def.tags}
                        onChange={(_, v) => updateDefinition(idx, dIdx, { tags: v })}
                        // renderTags={(value, getTagProps) =>
                        //   value.map((option, index) => (
                        //     <Chip
                        //       variant="outlined"
                        //       label={option}
                        //       {...getTagProps({ index })}
                        //       key={option}
                        //     />
                        //   ))
                        // }
                        renderInput={(params) => (
                          <TextField {...params} label="Tags" size="medium" />
                        )}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, md: 1 }} textAlign="end">
                      <IconButton
                        color="error"
                        onClick={() => removeDefinition(idx, dIdx)}
                        size="small"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Grid>
                    <Grid size={{ xs: 12 }}>
                      <TextField
                        label="Examples (one per line)"
                        fullWidth
                        multiline
                        minRows={2}
                        value={def.examples.join('\n')}
                        onChange={(e) =>
                          updateDefinition(idx, dIdx, {
                            examples: e.target.value.split('\n').map((v) => v.trim()),
                          })
                        }
                      />
                    </Grid>
                  </Grid>
                </Paper>
              ))}

              <Button startIcon={<AddIcon />} sx={{ mt: 2 }} onClick={() => addDefinition(idx)}>
                Add definition
              </Button>
            </Box>
          </Collapse>
        </Paper>
      ))}

      <Box textAlign="left" my={2}>
        <Button variant="contained" startIcon={<AddIcon />} onClick={addRow}>
          Add word
        </Button>
      </Box>

      <Paper sx={{ p: 2 }}>
        <Typography variant="h6" gutterBottom>
          Live JSON Preview
        </Typography>
        <Box component="pre" sx={{ fontSize: '0.8rem', whiteSpace: 'pre-wrap' }}>
          {buildJSON({ langFrom, langTo, source, entries })}
        </Box>
      </Paper>
    </Box>
  );
};
