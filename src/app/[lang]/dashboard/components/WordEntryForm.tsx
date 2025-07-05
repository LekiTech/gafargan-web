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
  Divider,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import { expressionFont } from '@/fonts';
import { useTranslation } from 'react-i18next';
import { flipAndMergeTags } from '@/search/definition/utils';
import { WebsiteLang } from '@api/types.model';

/* ---------------- types ---------------- */
interface Example {
  src: string;
  trl: string;
  tags?: string[];
}
interface Definition {
  value: string;
  tags?: string[];
  examples?: Example[];
}
interface WordDetail {
  inflection: string;
  tags?: string[];
  definitions: Definition[];
  examples?: Example[];
}
export interface EntryData {
  spelling: string;
  open: boolean;
  wordDetails: WordDetail[];
}

/* ---------------- constants ---------------- */
// const TAG_OPTIONS = ['noun', 'verb', 'adj', 'formal', 'archaic'] as const;

/* ---------------- helpers ---------------- */
const emptyDef = (seed = ''): Definition => ({ value: seed });
const emptyWD = (seed = ''): WordDetail => ({
  inflection: '',
  definitions: [emptyDef(seed)],
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
          autoComplete="off"
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
const ExampleLine: React.FC<{
  example: Example;
  onChange: (v: Example) => void;
  onDelete: () => void;
  isInnerBlockExample: boolean;
  tagEntries: Record<string, string>;
  allTags: [string, string][];
}> = ({ example, onChange, onDelete, isInnerBlockExample, tagEntries, allTags }) => {
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  const patch = (p: Partial<Definition>) => onChange({ ...example, ...p });
  return (
    <Box display="flex" alignItems="baseline" gap={2} mt={0.5}>
      {isInnerBlockExample && <Typography color="text.secondary">●</Typography>}
      {/* tags */}
      <Box display="flex" alignItems="baseline" gap={1} flexWrap="wrap">
        {example.tags?.map((t) => (
          <Chip
            key={t}
            label={tagEntries[t.split(';')[0]]}
            size="small"
            onDelete={() => patch({ tags: example.tags?.filter((x) => x !== t) })}
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
          selected={example.tags ?? []}
          onClose={() => setAnchor(null)}
          onChange={(tags) => patch({ tags })}
          allTags={allTags}
        />
      </Box>
      <TextField
        variant="standard"
        fullWidth
        value={example.src}
        onChange={(e) => onChange({ ...example, src: e.target.value })}
        placeholder="example"
        autoComplete="off"
        slotProps={{
          input: {
            disableUnderline: true,
            style: { borderBottom: '1px dashed #000' },
          },
        }}
      />
      <Typography color="text.secondary">:</Typography>
      <TextField
        variant="standard"
        fullWidth
        value={example.trl}
        onChange={(e) => onChange({ ...example, trl: e.target.value })}
        placeholder="example translation"
        autoComplete="off"
        slotProps={{
          input: {
            disableUnderline: true,
            style: { borderBottom: '1px dashed #000' },
          },
        }}
      />
      <IconButton size="small" onClick={onDelete} sx={{ alignSelf: 'flex-end' }} color="error">
        <DeleteOutlineIcon fontSize="small" />
      </IconButton>
    </Box>
  );
};

/* ---------------- DefinitionBlock ---------------- */
const DefinitionBlock: React.FC<{
  idx: number;
  def: Definition;
  onChange: (d: Definition) => void;
  onDelete: () => void;
  tagEntries: Record<string, string>;
  allTags: [string, string][];
}> = ({ idx, def, onChange, onDelete, tagEntries, allTags }) => {
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  const patch = (p: Partial<Definition>) => onChange({ ...def, ...p });
  const deleteEx = (i: number) => {
    if (def.examples && def.examples.length > 0) {
      patch({ examples: def.examples.filter((_, idx) => idx !== i) });
    }
  };
  return (
    <Box mt={1}>
      <Box display="flex" gap={1} alignItems="baseline">
        <Typography fontWeight={600}>{idx + 1}.</Typography>
        <Box display="flex" alignItems="baseline" gap={1} flexWrap="wrap">
          {def.tags?.map((t) => (
            <Chip
              key={t}
              label={tagEntries[t.split(';')[0]]}
              size="small"
              onDelete={() => patch({ tags: def.tags?.filter((x) => x !== t) })}
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
            selected={def.tags ?? []}
            onClose={() => setAnchor(null)}
            onChange={(tags) => patch({ tags })}
            allTags={allTags}
          />
        </Box>
        <TextField
          variant="standard"
          placeholder="definition"
          autoComplete="off"
          fullWidth
          value={def.value}
          onChange={(e) => patch({ value: e.target.value })}
        />
        <IconButton size="small" onClick={onDelete} color="error">
          <DeleteOutlineIcon fontSize="small" />
        </IconButton>
      </Box>
      <Box sx={{ display: 'flex', flexDirection: 'column', ml: 2.5 }}>
        {def.examples?.map((ex, i) => (
          <ExampleLine
            key={i}
            example={ex}
            isInnerBlockExample={true}
            onChange={(v) => {
              const copy = [...(def.examples ?? [])];
              copy[i] = v;
              patch({ examples: copy });
            }}
            onDelete={() => deleteEx(i)}
            tagEntries={tagEntries}
            allTags={allTags}
          />
        ))}
        <Chip
          label="example"
          icon={<AddIcon />}
          variant="outlined"
          color="primary"
          size="small"
          sx={{ width: 'fit-content', mt: 1.5 }}
          onClick={() => patch({ examples: [...(def.examples ?? []), { src: '', trl: '' }] })}
        />
      </Box>
    </Box>
  );
};

/* ---------------- WordDetailBlock ---------------- */
const WordDetailBlock: React.FC<{
  data: WordDetail;
  onChange: (wd: WordDetail) => void;
  onDelete: () => void;
  lang: WebsiteLang;
}> = ({ data, onChange, onDelete, lang }) => {
  const { t, i18n } = useTranslation(lang);
  const tagEntries = i18n.getResourceBundle(lang, 'tags');
  const allTags = Object.entries(flipAndMergeTags(tagEntries)).filter(
    (kv) => kv != null && kv[0] != null && kv[1] != null,
  ) as [string, string][];

  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  const patch = (p: Partial<WordDetail>) => onChange({ ...data, ...p });
  const updateDef = (i: number, def: Definition) =>
    patch({ definitions: data.definitions.map((d, idx) => (idx === i ? def : d)) });
  const deleteDef = (i: number) => {
    if (data.definitions.length > 1) {
      patch({ definitions: data.definitions.filter((_, idx) => idx !== i) });
    }
  };
  const deleteExtraEx = (i: number) => {
    if (data.examples && data.examples.length > 0) {
      patch({ examples: data.examples.filter((_, idx) => idx !== i) });
    }
  };
  return (
    <Box mt={2} pl={1} ml={1.5} borderLeft="3px solid rgba(0,0,0,0.54)" className="word-detail">
      <Stack direction="row" gap={2}>
        {/* tags */}
        <Box mt={1} display="flex" alignItems="center" gap={1} flexWrap="wrap">
          {data.tags?.map((t) => (
            <Chip
              key={t}
              label={tagEntries[t.split(';')[0]]}
              size="small"
              onDelete={() => patch({ tags: data.tags?.filter((x) => x !== t) })}
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
            selected={data.tags ?? []}
            onClose={() => setAnchor(null)}
            onChange={(tags) => patch({ tags })}
            allTags={allTags}
          />
        </Box>
        {/* inflection */}
        <TextField
          variant="standard"
          placeholder="inflection"
          autoComplete="off"
          value={data.inflection}
          onChange={(e) => patch({ inflection: e.target.value })}
          sx={{ width: 200 }}
        />
        <Box sx={{ width: '100%' }} />
        <IconButton size="small" onClick={onDelete} color="error">
          <DeleteOutlineIcon fontSize="small" />
        </IconButton>
      </Stack>
      {/* definitions */}
      {data.definitions.map((d, i) => (
        <Box key={i}>
          <Divider sx={{ mt: 1.5 }} />
          <DefinitionBlock
            idx={i}
            def={d}
            onChange={(def) => updateDef(i, def)}
            onDelete={() => deleteDef(i)}
            tagEntries={tagEntries}
            allTags={allTags}
          />
        </Box>
      ))}

      {/* word‑detail examples */}
      {data.examples?.map((ex, i) => (
        <ExampleLine
          key={i}
          example={ex}
          isInnerBlockExample={false}
          onChange={(v) => {
            const copy = [...(data.examples ?? [])];
            copy[i] = v;
            patch({ examples: copy });
          }}
          onDelete={() => deleteExtraEx(i)}
          tagEntries={tagEntries}
          allTags={allTags}
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
          startIcon={<AddIcon />}
          onClick={() => patch({ definitions: [...data.definitions, emptyDef()] })}
        >
          definition
        </Button>
        <Button
          variant="outlined"
          size="small"
          startIcon={<AddIcon />}
          onClick={() => patch({ examples: [...(data.examples ?? []), { src: '', trl: '' }] })}
        >
          other examples
        </Button>
      </Box>
    </Box>
  );
};

/* ---------------- Entry ---------------- */
const Entry: React.FC<{
  entry: EntryData;
  onChange: (e: EntryData) => void;
  onDelete: () => void;
  lang: WebsiteLang;
  isFirst?: boolean;
  isLast?: boolean;
}> = ({ entry, onChange, onDelete, lang, isFirst, isLast }) => {
  // const theme = useTheme();
  // const isMdDownSize = useMediaQuery(theme.breakpoints.down('md'));
  const toggleOpen = () => {
    if (!entry.open && entry.wordDetails.length === 0) {
      onChange({
        ...entry,
        open: true,
        wordDetails: [emptyWD(entry.wordDetails[0].definitions[0].value)],
      });
    } else {
      onChange({ ...entry, open: !entry.open });
    }
  };
  const addWD = () =>
    onChange({ ...entry, wordDetails: [...entry.wordDetails, emptyWD()], open: true });
  const updateWD = (i: number, wd: WordDetail) =>
    onChange({ ...entry, wordDetails: entry.wordDetails.map((w, idx) => (idx === i ? wd : w)) });
  const deleteWD = (i: number) => {
    if (entry.wordDetails.length > 1) {
      onChange({ ...entry, wordDetails: entry.wordDetails.filter((_, idx) => idx !== i) });
    }
  };
  return (
    <Box
      sx={{
        border: '1px solid #333',
        borderTopLeftRadius: isFirst ? '4px' : 0,
        borderTopRightRadius: isFirst ? '4px' : 0,
        borderBottomLeftRadius: isLast ? '4px' : 0,
        borderBottomRightRadius: isLast ? '4px' : 0,
      }}
    >
      {/* top line */}
      <Box display="flex" alignItems="flex-end" gap={1} sx={{ width: '100%' }}>
        <IconButton size="small" onClick={toggleOpen}>
          {entry.open ? <ExpandLessIcon /> : <ExpandMoreIcon />}
        </IconButton>
        <TextField
          variant="standard"
          value={entry.spelling}
          placeholder="word"
          autoComplete="off"
          onChange={(e) => onChange({ ...entry, spelling: e.target.value })}
          sx={{
            minWidth: '30%',
            '& .MuiInput-root': {
              ...expressionFont.style,
              fontWeight: 'bold',
            },
          }}
          slotProps={{
            input: { disableUnderline: !entry.open },
          }}
        />
        <Box
          sx={{ height: '34px', p: '5px 0', borderRight: entry.open ? 'unset' : '1px solid #333' }}
        >
          {/* {entry.open && <Typography>:</Typography>} */}
        </Box>
        {!entry.open ? (
          <TextField
            variant="standard"
            fullWidth
            value={entry.wordDetails[0].definitions[0].value}
            placeholder="definition"
            autoComplete="off"
            onChange={(e) => {
              const copy = { ...entry };
              copy.wordDetails[0].definitions[0].value = e.target.value;
              onChange(copy);
            }}
            slotProps={{
              input: { disableUnderline: !entry.open },
            }}
          />
        ) : (
          <div style={{ flex: 1, width: '100%' }} />
        )}
        <IconButton size="small" onClick={onDelete} sx={{ alignSelf: 'flex-end' }} color="error">
          <DeleteIcon fontSize="small" />
        </IconButton>
      </Box>

      {/* collapsible */}
      {entry.open && (
        <Box mt={1} mb={1}>
          {entry.wordDetails.map((wd, i) => (
            <WordDetailBlock
              key={i}
              data={wd}
              onChange={(d) => updateWD(i, d)}
              onDelete={() => deleteWD(i)}
              lang={lang}
            />
          ))}
          <Button
            variant="outlined"
            size="small"
            startIcon={<AddIcon />}
            onClick={addWD}
            sx={{ mt: 1, ml: 1.5 }}
          >
            word details block
          </Button>
        </Box>
      )}
    </Box>
  );
};

/* ---------------- Root component ---------------- */
export const WordEntryForm: React.FC<{ lang: WebsiteLang }> = ({ lang }) => {
  const [entries, setEntries] = useState<EntryData[]>([
    {
      spelling: '',
      open: false,
      wordDetails: [{ inflection: '', definitions: [{ value: '' }] }],
    },
  ]);
  const addEntry = () =>
    setEntries((prev) => [...prev, { spelling: '', open: false, wordDetails: [emptyWD('')] }]);
  const updateEntry = (i: number, e: EntryData) =>
    setEntries((prev) => prev.map((en, idx) => (idx === i ? e : en)));
  const deleteEntry = (i: number) =>
    setEntries((prev) => {
      if (prev.length > 1) {
        return prev.filter((_, idx) => idx !== i);
      }
      return prev;
    });
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
          onDelete={() => deleteEntry(idx)}
          lang={lang}
          isFirst={idx === 0}
          isLast={idx === entries.length - 1}
        />
      ))}
      <Button
        variant="contained"
        size="small"
        startIcon={<AddIcon />}
        onClick={addEntry}
        sx={{ mt: '4px' }}
      >
        Gaf
      </Button>
      {/* <IconButton
        onClick={addEntry}
        sx={(theme) => ({
          mt: '4px',
          backgroundColor: theme.palette.primary.main,
          color: theme.palette.primary.contrastText,
          borderRadius: '4px',
          ':hover': {
            backgroundColor: theme.palette.primary.dark,
            color: theme.palette.primary.contrastText,
          },
        })}
      >
        <AddIcon />
      </IconButton> */}

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
