'use client';
import React, { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  IconButton,
  Select,
  MenuItem,
  Chip,
  Popover,
  Button,
  Stack,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import { expressionFont } from '@/fonts';
import { useTranslation } from 'react-i18next';
import { flipAndMergeTags } from '@/search/definition/utils';
import { WebsiteLang } from '@api/types.model';

/* ---------------- types ---------------- */
interface Definition {
  txt: string;
  tags: string[];
  ex: string[];
}
interface WordDetail {
  inf: string;
  tags: string[];
  defs: Definition[];
  extraEx: string[];
}
export interface EntryData {
  spelling: string;
  quick: string;
  open: boolean;
  wordDetails: WordDetail[];
}

/* ---------------- constants ---------------- */
// const TAG_OPTIONS = ['noun', 'verb', 'adj', 'formal', 'archaic'] as const;

/* ---------------- helpers ---------------- */
const emptyDef = (seed = ''): Definition => ({ txt: seed, tags: [], ex: [] });
const emptyWD = (seed = ''): WordDetail => ({
  inf: '',
  tags: [],
  defs: [emptyDef(seed)],
  extraEx: [],
});

/* ---------------- TagSelector ---------------- */
interface TagSelectorProps {
  anchorEl: HTMLElement | null;
  selected: string[];
  onClose: () => void;
  onChange: (next: string[]) => void;
  allTags: [string, string][];
}
const TagSelector: React.FC<TagSelectorProps> = ({
  anchorEl,
  selected,
  onClose,
  onChange,
  allTags,
}) => {
  const [filter, setFilter] = useState('');
  // const matches = TAG_OPTIONS.filter((t) => t.includes(filter));
  const matches = allTags.filter((t) => t[0].toLowerCase().includes(filter.toLowerCase()));
  const toggle = (t: string) => {
    onChange(selected.includes(t) ? selected.filter((x) => x !== t) : [...selected, t]);
  };
  return (
    <Popover open={Boolean(anchorEl)} anchorEl={anchorEl} onClose={onClose} disableAutoFocus>
      <Box p={1} maxWidth={160}>
        <TextField
          size="small"
          fullWidth
          placeholder="search tag"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        />
        <Stack direction="row" flexWrap="wrap" gap={1} mt={1}>
          {matches.map((t) => (
            <Chip
              key={t[1]}
              label={t[0]}
              clickable
              size="small"
              color={selected.includes(t[1]) ? 'primary' : undefined}
              onClick={() => toggle(t[1])}
              sx={{ fontSize: '0.75rem' }}
            />
          ))}
        </Stack>
      </Box>
    </Popover>
  );
};

/* ---------------- ExampleLine ---------------- */
const ExampleLine: React.FC<{ value: string; onChange: (v: string) => void }> = ({
  value,
  onChange,
}) => (
  <Box display="flex" alignItems="center" gap={1} mt={0.5} ml={3}>
    <Typography color="text.secondary">—</Typography>
    <TextField
      variant="standard"
      fullWidth
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder="example"
      InputProps={{ disableUnderline: true }}
    />
  </Box>
);

/* ---------------- DefinitionBlock ---------------- */
const DefinitionBlock: React.FC<{
  idx: number;
  def: Definition;
  onChange: (d: Definition) => void;
  tagEntries: Record<string, string>;
  allTags: [string, string][];
}> = ({ idx, def, onChange, tagEntries, allTags }) => {
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  const patch = (p: Partial<Definition>) => onChange({ ...def, ...p });
  return (
    <Box mt={1}>
      <Box display="flex" gap={1} alignItems="center">
        <Typography fontWeight={600}>{idx + 1}.</Typography>
        <Box display="flex" alignItems="center" gap={1} flexWrap="wrap">
          {def.tags.map((t) => (
            <Chip
              key={t}
              label={t.split(';')[0]}
              size="small"
              onDelete={() => patch({ tags: def.tags.filter((x) => x !== t) })}
            />
          ))}
          <Chip
            label="tags"
            icon={<AddIcon />}
            variant="outlined"
            color="primary"
            size="small"
            onClick={(e) => setAnchor(e.currentTarget)}
          />
          <TagSelector
            anchorEl={anchor}
            selected={def.tags}
            onClose={() => setAnchor(null)}
            onChange={(tags) => patch({ tags })}
            allTags={allTags}
          />
        </Box>
        <TextField
          variant="standard"
          placeholder="definition"
          fullWidth
          value={def.txt}
          onChange={(e) => patch({ txt: e.target.value })}
        />
        <Chip
          label="example"
          icon={<AddIcon />}
          variant="outlined"
          color="primary"
          size="small"
          onClick={() => patch({ ex: [...def.ex, ''] })}
        />
      </Box>
      {def.ex.map((ex, i) => (
        <ExampleLine
          key={i}
          value={ex}
          onChange={(v) => {
            const copy = [...def.ex];
            copy[i] = v;
            patch({ ex: copy });
          }}
        />
      ))}
    </Box>
  );
};

/* ---------------- WordDetailBlock ---------------- */
const WordDetailBlock: React.FC<{
  data: WordDetail;
  onChange: (wd: WordDetail) => void;
  lang: WebsiteLang;
}> = ({ data, onChange, lang }) => {
  const { t, i18n } = useTranslation(lang);
  const tagEntries = i18n.getResourceBundle(lang, 'tags');
  const allTags = Object.entries(flipAndMergeTags(tagEntries)).filter(
    (kv) => kv != null && kv[0] != null && kv[1] != null,
  ) as [string, string][];

  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  const patch = (p: Partial<WordDetail>) => onChange({ ...data, ...p });
  const updateDef = (i: number, def: Definition) =>
    patch({ defs: data.defs.map((d, idx) => (idx === i ? def : d)) });
  return (
    <Box mt={2} pl={1} ml={1.5} borderLeft="3px solid rgba(0,0,0,0.54)" className="word-detail">
      <Stack direction="row" gap={2}>
        <TextField
          variant="standard"
          placeholder="inflection"
          value={data.inf}
          onChange={(e) => patch({ inf: e.target.value })}
          sx={{ width: 100 }}
        />
        {/* tags */}
        <Box mt={1} display="flex" alignItems="center" gap={1} flexWrap="wrap">
          {data.tags.map((t) => (
            <Chip
              key={t}
              label={tagEntries[t.split(';')[0]]}
              size="small"
              onDelete={() => patch({ tags: data.tags.filter((x) => x !== t) })}
            />
          ))}
          <Chip
            label="tags"
            icon={<AddIcon />}
            variant="outlined"
            color="primary"
            size="small"
            onClick={(e) => setAnchor(e.currentTarget)}
          />
          <TagSelector
            anchorEl={anchor}
            selected={data.tags}
            onClose={() => setAnchor(null)}
            onChange={(tags) => patch({ tags })}
            allTags={allTags}
          />
        </Box>
      </Stack>
      {/* definitions */}
      {data.defs.map((d, i) => (
        <DefinitionBlock
          key={i}
          idx={i}
          def={d}
          onChange={(def) => updateDef(i, def)}
          tagEntries={tagEntries}
          allTags={allTags}
        />
      ))}

      {/* word‑detail examples */}
      {data.extraEx.map((ex, i) => (
        <ExampleLine
          key={i}
          value={ex}
          onChange={(v) => {
            const copy = [...data.extraEx];
            copy[i] = v;
            patch({ extraEx: copy });
          }}
        />
      ))}

      {/* controls */}
      <Box
        mt={2}
        mb={1}
        gap={1}
        sx={{ display: 'flex', flexDirection: 'column', width: 'fit-content' }}
      >
        <Button
          variant="outlined"
          size="small"
          onClick={() => patch({ defs: [...data.defs, emptyDef()] })}
        >
          ＋ add definition
        </Button>
        <Button
          variant="outlined"
          size="small"
          onClick={() => patch({ extraEx: [...data.extraEx, ''] })}
        >
          ＋ other examples
        </Button>
      </Box>
    </Box>
  );
};

/* ---------------- Entry ---------------- */
const Entry: React.FC<{
  entry: EntryData;
  onChange: (e: EntryData) => void;
  onRemove: () => void;
  lang: WebsiteLang;
}> = ({ entry, onChange, onRemove, lang }) => {
  // const theme = useTheme();
  // const isMdDownSize = useMediaQuery(theme.breakpoints.down('md'));
  const toggleOpen = () => {
    if (!entry.open && entry.wordDetails.length === 0) {
      onChange({ ...entry, open: true, wordDetails: [emptyWD(entry.quick)] });
    } else {
      onChange({ ...entry, open: !entry.open });
    }
  };
  const updateWD = (i: number, wd: WordDetail) =>
    onChange({ ...entry, wordDetails: entry.wordDetails.map((w, idx) => (idx === i ? wd : w)) });
  const addWD = () =>
    onChange({ ...entry, wordDetails: [...entry.wordDetails, emptyWD()], open: true });
  return (
    <Box mb={2} ml={1.5}>
      {/* top line */}
      <Box display="flex" alignItems="flex-end" gap={1} sx={{ width: '100%' }}>
        <IconButton size="small" onClick={toggleOpen} sx={{ ml: '-20px' }}>
          {entry.open ? <ExpandLessIcon /> : <ExpandMoreIcon />}
        </IconButton>
        <TextField
          variant="standard"
          value={entry.spelling}
          placeholder="word"
          onChange={(e) => onChange({ ...entry, spelling: e.target.value })}
          sx={{
            minWidth: '30%',
            '& .MuiInput-root': {
              ...expressionFont.style,
              fontWeight: 'bold',
            },
          }}
        />
        <Typography>:</Typography>
        {!entry.open ? (
          <TextField
            variant="standard"
            fullWidth
            value={entry.quick}
            placeholder="definition"
            onChange={(e) => onChange({ ...entry, quick: e.target.value })}
          />
        ) : (
          <div style={{ flex: 1, width: '100%' }} />
        )}
        <IconButton size="small" onClick={onRemove} sx={{ alignSelf: 'flex-end' }} color="error">
          <DeleteIcon fontSize="small" />
        </IconButton>
      </Box>

      {/* collapsible */}
      {entry.open && (
        <Box mt={1}>
          {entry.wordDetails.map((wd, i) => (
            <WordDetailBlock key={i} data={wd} onChange={(d) => updateWD(i, d)} lang={lang} />
          ))}
          <Button variant="outlined" size="small" onClick={addWD} sx={{ mt: 1, ml: 1.5 }}>
            ＋ add word details block
          </Button>
        </Box>
      )}
    </Box>
  );
};

/* ---------------- Root component ---------------- */
export const WordEntry2: React.FC<{ lang: WebsiteLang }> = ({ lang }) => {
  const [entries, setEntries] = useState<EntryData[]>([
    { spelling: '', quick: '', open: false, wordDetails: [] },
  ]);
  const addEntry = () =>
    setEntries((prev) => [...prev, { spelling: '', quick: '', open: false, wordDetails: [] }]);
  const updateEntry = (i: number, e: EntryData) =>
    setEntries((prev) => prev.map((en, idx) => (idx === i ? e : en)));
  const removeEntry = (i: number) => setEntries((prev) => prev.filter((_, idx) => idx !== i));
  return (
    <Box sx={{ maxWidth: 600 }}>
      {/* header + selectors */}
      <Box display="flex" alignItems="center" gap={1} mb={2}>
        <Select size="small" defaultValue="EN_US">
          <MenuItem value="EN_US">English (US)</MenuItem>
          <MenuItem value="FR_FR">French (FR)</MenuItem>
        </Select>
        <Typography>→</Typography>
        <Select size="small" defaultValue="FR_FR">
          <MenuItem value="FR_FR">French (FR)</MenuItem>
          <MenuItem value="EN_US">English (US)</MenuItem>
        </Select>
        <Typography>• Source:</Typography>
        <Select size="small" defaultValue="Book X, 1992">
          <MenuItem value="Book X, 1992">Book X (1992)</MenuItem>
          <MenuItem value="Corpus Y">Corpus Y</MenuItem>
        </Select>
      </Box>

      {entries.map((en, idx) => (
        <Entry
          key={idx}
          entry={en}
          onChange={(e) => updateEntry(idx, e)}
          onRemove={() => removeEntry(idx)}
          lang={lang}
        />
      ))}

      <Button
        variant="contained"
        size="small"
        disableElevation
        onClick={addEntry}
        startIcon={<AddIcon />}
      >
        Add new word
      </Button>

      {/* live json */}
      <Box mt={4}>
        <Typography fontWeight={600} variant="subtitle1">
          Live JSON
        </Typography>
        <pre style={{ background: '#fafaf8', border: '1px solid #ecece6', padding: '0.8rem' }}>
          {JSON.stringify(entries, null, 2)}
        </pre>
      </Box>
    </Box>
  );
};
