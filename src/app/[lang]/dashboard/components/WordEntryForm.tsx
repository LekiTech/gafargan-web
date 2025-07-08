'use client';
import React, { useRef, useState } from 'react';
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
  Grid,
  Snackbar,
  Alert,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import AutoStoriesIcon from '@mui/icons-material/AutoStories';
import { expressionFont } from '@/fonts';
import { useTranslation } from 'react-i18next';
import { flipAndMergeTags } from '@/search/definition/utils';
import { DictionaryLang, WebsiteLang } from '@api/types.model';
import { DictionaryLangs } from '@api/languages';
import { SourcesCreatableSelect, OptionType } from './SearchableCreatableSelect';

/* ---------------- types ---------------- */
interface ExampleModel {
  src: string;
  trl: string;
  tags?: string[];
}
interface DefinitionModel {
  value: string;
  tags?: string[];
  examples?: ExampleModel[];
}
interface WordDetailModel {
  inflection: string;
  tags?: string[];
  definitions: DefinitionModel[];
  examples?: ExampleModel[];
}
interface WordModel {
  spelling: string;
  open: boolean;
  wordDetails: WordDetailModel[];
}

interface SourceShortModel {
  name: string;
  authors?: string;
}

class DictionaryModel {
  readonly version = 'V3-mini';
  readonly entries: WordModel[] = [];
  readonly source: SourceShortModel;

  constructor(source: SourceShortModel) {
    this.source = source;
  }
}

/* ---------------- constants ---------------- */
// const TAG_OPTIONS = ['noun', 'verb', 'adj', 'formal', 'archaic'] as const;

/* ---------------- helpers ---------------- */
const emptyDef = (seed = ''): DefinitionModel => ({ value: seed });
const emptyWD = (seed = ''): WordDetailModel => ({
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
  example: ExampleModel;
  onChange: (v: ExampleModel) => void;
  onDelete: () => void;
  isInnerBlockExample: boolean;
  tagEntries: Record<string, string>;
  allTags: [string, string][];
}> = ({ example, onChange, onDelete, isInnerBlockExample, tagEntries, allTags }) => {
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  const patch = (p: Partial<DefinitionModel>) => onChange({ ...example, ...p });
  return (
    <Box display="flex" alignItems="baseline" gap={2} mt={0.5}>
      {isInnerBlockExample && <Typography color="text.secondary">●</Typography>}
      {/* tags */}
      <Box
        display="flex"
        alignItems="baseline"
        gap={1}
        flexWrap="wrap"
        sx={{ alignSelf: 'end', mt: '5px' }}
      >
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
  def: DefinitionModel;
  onChange: (d: DefinitionModel) => void;
  onDelete: () => void;
  tagEntries: Record<string, string>;
  allTags: [string, string][];
}> = ({ idx, def, onChange, onDelete, tagEntries, allTags }) => {
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  const patch = (p: Partial<DefinitionModel>) => onChange({ ...def, ...p });
  const deleteEx = (i: number) => {
    if (def.examples && def.examples.length > 0) {
      patch({ examples: def.examples.filter((_, idx) => idx !== i) });
    }
  };
  return (
    <Box mt={1}>
      <Box display="flex" gap={1} alignItems="baseline">
        <Typography fontWeight={600}>{idx + 1}.</Typography>
        {/* tags */}
        <Box
          display="flex"
          alignItems="baseline"
          gap={1}
          flexWrap="wrap"
          sx={{ alignSelf: 'end', mt: '5px' }}
        >
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
  data: WordDetailModel;
  onChange: (wd: WordDetailModel) => void;
  onDelete: () => void;
  lang: WebsiteLang;
}> = ({ data, onChange, onDelete, lang }) => {
  const { t, i18n } = useTranslation(lang);
  const tagEntries = i18n.getResourceBundle(lang, 'tags');
  const allTags = Object.entries(flipAndMergeTags(tagEntries)).filter(
    (kv) => kv != null && kv[0] != null && kv[1] != null,
  ) as [string, string][];

  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  const patch = (p: Partial<WordDetailModel>) => onChange({ ...data, ...p });
  const updateDef = (i: number, def: DefinitionModel) =>
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
  idx: number;
  entry: WordModel;
  onChange: (e: WordModel) => void;
  onDelete: () => void;
  lang: WebsiteLang;
  isFirst?: boolean;
  isLast?: boolean;
}> = ({ idx, entry, onChange, onDelete, lang, isFirst, isLast }) => {
  // const theme = useTheme();
  // const isMdDownSize = useMediaQuery(theme.breakpoints.down('md'));
  const [showCannotDeleteMessage, setShowCannotDeleteMessage] = React.useState(false);
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
  const updateWD = (i: number, wd: WordDetailModel) =>
    onChange({ ...entry, wordDetails: entry.wordDetails.map((w, idx) => (idx === i ? wd : w)) });
  const deleteWD = (i: number) => {
    if (entry.wordDetails.length > 1) {
      onChange({ ...entry, wordDetails: entry.wordDetails.filter((_, idx) => idx !== i) });
    } else {
      setShowCannotDeleteMessage(true);
    }
  };
  return (
    <Box
      sx={{
        position: 'relative',
        border: '1px solid #333',
        borderBottom: isLast ? undefined : 'unset',
        borderTopLeftRadius: isFirst ? '4px' : 0,
        borderTopRightRadius: isFirst ? '4px' : 0,
        borderBottomLeftRadius: isLast ? '4px' : 0,
        borderBottomRightRadius: isLast ? '4px' : 0,
      }}
    >
      {/* top line */}
      <Typography
        variant="caption"
        sx={{
          position: 'absolute',
          width: '20px',
          left: '-25px',
          top: 0,
          textAlign: 'right',
          color: '#777',
        }}
      >
        {idx}
      </Typography>
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
        <Snackbar
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
          open={showCannotDeleteMessage}
          autoHideDuration={6000}
          onClose={() => setShowCannotDeleteMessage(false)}
        >
          <Alert severity="error" variant="filled" sx={{ width: '100%' }}>
            Cannot delete the only meanings group
          </Alert>
        </Snackbar>
      </Box>

      {/* collapsible */}
      {entry.open && (
        <Box mt={1} pb={1}>
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
            meanings group
          </Button>
        </Box>
      )}
    </Box>
  );
};

/* ---------------- Root component ---------------- */
export const WordEntryForm: React.FC<{ lang: WebsiteLang }> = ({ lang }) => {
  const { t } = useTranslation(lang);
  const langs = t('languages', { ns: 'common', returnObjects: true }) as Record<
    DictionaryLang,
    string
  >;
  const addEntryButtonRef = useRef<HTMLButtonElement>(null);
  // Entries
  const [entries, setEntries] = useState<WordModel[]>([
    {
      spelling: '',
      open: false,
      wordDetails: [{ inflection: '', definitions: [{ value: '' }] }],
    },
  ]);
  const addEntry = () => {
    setEntries((prev) => [...prev, { spelling: '', open: false, wordDetails: [emptyWD('')] }]);
    addEntryButtonRef.current?.scrollIntoView({ block: 'start' });
  };
  const updateEntry = (i: number, e: WordModel) =>
    setEntries((prev) => prev.map((en, idx) => (idx === i ? e : en)));
  const deleteEntry = (i: number) =>
    setEntries((prev) => {
      if (prev.length > 1) {
        return prev.filter((_, idx) => idx !== i);
      }
      return prev;
    });

  // Sources
  const [options, setOptions] = useState<OptionType[]>([
    { name: 'Лезгинско-Русский Словарь', authors: 'Бабаханов М.М.' },
    { name: 'Русско-Лезгинский Словарь', authors: 'Гаджиев М.М.' },
  ]);
  const [value, setValue] = useState<OptionType | null>(null);

  const handleCreate = (created: OptionType) => {
    // Persist locally (or via API)
    setOptions((prev) => [...prev, created]);
  };
  return (
    <Box sx={(theme) => ({ maxWidth: 600, [theme.breakpoints.down('md')]: { ml: 1.5 } })}>
      {/* header + selectors */}
      <Grid container columns={{ xs: 6 }} gap={1} mb={5}>
        <Grid size={{ xs: 6 }} display="flex" alignItems="center" gap={1}>
          <SourcesCreatableSelect
            label="📚 Source"
            options={options}
            value={value}
            onChange={setValue}
            onCreate={handleCreate}
            placeholder="Choose or add"
          />
        </Grid>
        <Grid size={{ xs: 6 }} display="flex" alignItems="center" gap={1}>
          <Select size="small" value="lez" sx={{ flex: 1 }}>
            {DictionaryLangs.map((lang) => (
              <MenuItem key={lang.toString()} value={lang}>
                {langs[lang]}
              </MenuItem>
            ))}
          </Select>
          <Typography>→</Typography>
          <Select size="small" value="rus" sx={{ flex: 1 }}>
            {DictionaryLangs.map((lang) => (
              <MenuItem key={lang.toString()} value={lang}>
                {langs[lang]}
              </MenuItem>
            ))}
          </Select>
        </Grid>
        {/* <Typography>•</Typography> */}
      </Grid>

      {entries.map((en, idx) => (
        <Entry
          key={idx}
          idx={idx + 1}
          entry={en}
          onChange={(e) => updateEntry(idx, e)}
          onDelete={() => deleteEntry(idx)}
          lang={lang}
          isFirst={idx === 0}
          isLast={idx === entries.length - 1}
        />
      ))}
      <Button
        ref={addEntryButtonRef}
        variant="contained"
        size="small"
        startIcon={<AddIcon />}
        onClick={addEntry}
        sx={{ mt: '4px', mb: 3 }}
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
