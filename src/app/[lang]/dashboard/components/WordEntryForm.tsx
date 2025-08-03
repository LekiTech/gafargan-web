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
  Divider,
  Grid,
  Snackbar,
  Alert,
  InputAdornment,
  Menu,
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import { expressionFont } from '@/fonts';
import { useTranslation } from 'react-i18next';
import { flipAndMergeTags } from '@/search/definition/utils';
import { DictionaryLang, WebsiteLang } from '@api/types.model';
import { SourcesCreatableSelect } from './SearchableCreatableSelect';
import {
  DefinitionModel,
  WordDetailModel,
  TranslationModel,
  WordModel,
  DefinitionModelType,
  TranslationModelType,
  WordDetailModelType,
  DictionaryProposalModel,
  SourceModel,
  SourceModelType,
  SpellingVariantModel,
} from '../models/proposal.model';
import { LangDialects } from '@repository/constants';
import { SpellingVariant } from '@repository/entities/SpellingVariant';
import { IdToLang, LangToId } from '@api/languages';

const BUTTON_PASTEL_COLORS_BLUE = {
  bgcolor: 'rgb(220, 240, 250)',
  color: 'rgb(100, 125, 160)',
  '&:hover': {
    bgcolor: 'rgb(170, 205, 240)',
    color: 'rgb(60, 90, 130)',
  },
};

const BUTTON_PASTEL_COLORS_PURPLE = {
  bgcolor: 'rgb(220, 215, 240)',
  color: 'rgb(130, 125, 165)',
  '&:hover': {
    bgcolor: 'rgb(190, 185, 250)',
    color: 'rgb(100, 95, 165)',
  },
};

const BUTTON_PASTEL_COLORS_GREEN = {
  bgcolor: 'rgb(240, 250, 225)',
  color: 'rgb(170, 200, 145)',
  '&:hover': {
    bgcolor: 'rgb(215, 240, 180)',
    color: 'rgb(140, 200, 80)',
  },
};

const INPUT_PASTEL_BEIGE = '#fffde799';

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
  example: TranslationModel;
  onChange: (v: TranslationModel) => void;
  onDelete: () => void;
  isInnerBlockExample: boolean;
  tagEntries: Record<string, string>;
  allTags: [string, string][];
}> = ({ example, onChange, onDelete, isInnerBlockExample, tagEntries, allTags }) => {
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
              label="language / dialect"
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
        </Box>
        {/* tags */}
        <Box display="flex" gap={1} flexWrap="wrap">
          {example
            .getTags()
            ?.map((t) => (
              <Chip
                key={t}
                label={tagEntries[t.split(';')[0]]}
                size="small"
                onDelete={() => patch({ tags: example.getTags()?.filter((x) => x !== t) })}
              />
            ))}
          <Chip
            label="tags"
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
          />
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
            >
              {getRemainingLangDialectIds({ includeId: langDialectId.toString() }).map(
                ([id, name]) => (
                  <MenuItem key={id} value={id}>
                    {name}
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
                  placeholder="example"
                  autoComplete="off"
                  slotProps={{
                    input: {
                      disableUnderline: true,
                      style: { borderBottom: '1px dashed #000' },
                      endAdornment: example.getPhrasesByLangDialect(langDialectId)!.length > 1 && (
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
            <IconButton
              size="small"
              onClick={() => {
                const currentPhrases = example.getPhrasesByLangDialect(langDialectId)!;
                example.setPhrasesByLangDialect(langDialectId, [...currentPhrases, { phrase: '' }]);
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
          </Box>
        ))}
      </Box>
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
  wordLangDialectId: number;
  definitionsLangDialectId: number;
}> = ({
  idx,
  def,
  onChange,
  onDelete,
  tagEntries,
  allTags,
  wordLangDialectId,
  definitionsLangDialectId,
}) => {
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
      <Box display="flex" gap={1} alignItems="baseline">
        <Typography fontWeight={600}>{idx + 1}.</Typography>
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
              alignSelf: 'end',
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
                  onDelete={() => patch({ tags: def.getTags()?.filter((x) => x !== t) })}
                />
              ))}
            <Chip
              label="tags"
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
            />
          </Box>
          <TextField
            variant="standard"
            required
            placeholder="definition *"
            slotProps={{
              input: {
                // It works buggy on MUI, so skipping for now
                // onInvalid: (e) =>
                //   (e.target as HTMLInputElement).setCustomValidity('Definition cannot be empty'),
              },
            }}
            sx={{ bgcolor: INPUT_PASTEL_BEIGE, '& .MuiInputBase-root': { pl: 1 } }}
            autoComplete="off"
            fullWidth
            value={def.getValue()}
            onChange={(e) => patch({ value: e.target.value })}
          />
        </Box>
        <IconButton size="small" onClick={onDelete} color="error">
          <DeleteOutlineIcon fontSize="small" />
        </IconButton>
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
          />
        ))}
        <Chip
          label="example"
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
  allSources: SourceModel[];
  wordLangDialectId: number;
}> = ({ data, onChange, onDelete, lang, allSources, wordLangDialectId }) => {
  const { t, i18n } = useTranslation(lang);
  const tagEntries = i18n.getResourceBundle(lang, 'tags');
  const allTags = Object.entries(flipAndMergeTags(tagEntries)).filter(
    (kv) => kv != null && kv[0] != null && kv[1] != null,
  ) as [string, string][];
  const [showCannotDeleteMessage, setShowCannotDeleteMessage] = React.useState(false);
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  const patch = (p: Partial<WordDetailModelType>) => onChange(data.merge(p));
  const updateDef = (i: number, def: DefinitionModel) =>
    patch({ definitions: data.getDefinitions().map((d, idx) => (idx === i ? def : d)) });
  const deleteDef = (i: number) => {
    if (data.getDefinitions().length > 1) {
      patch({ definitions: data.getDefinitions().filter((_, idx) => idx !== i) });
    } else {
      setShowCannotDeleteMessage(true);
    }
  };
  const deleteExtraEx = (i: number) => {
    const defExamples = data.getExamples();
    if (defExamples && defExamples.length > 0) {
      patch({ examples: defExamples.filter((_, idx) => idx !== i) });
    }
  };
  return (
    <Box
      ml={1.5}
      my={2}
      pl={1}
      py={0.5}
      borderLeft="3px solid rgba(0,0,0,0.54)"
      className="word-detail"
    >
      <Snackbar
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        open={showCannotDeleteMessage}
        autoHideDuration={6000}
        onClose={() => setShowCannotDeleteMessage(false)}
      >
        <Alert severity="error" variant="filled" sx={{ width: '100%' }}>
          Cannot delete the only definition
        </Alert>
      </Snackbar>
      <Box
        sx={(theme) => ({
          mb: 1,
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          gap: 3,
          [theme.breakpoints.down('md')]: {
            flexDirection: 'column',
            alignItems: 'flex-start',
            gap: 1,
          },
        })}
      >
        <Select
          size="small"
          variant="standard"
          value={data.getLangDialectId()}
          sx={(theme) => ({
            flex: 1,
            fontSize: '0.875rem',
            color: theme.palette.text.secondary,
            minWidth: 200,
            maxWidth: 200,
          })}
          onChange={(e) => {
            data.setLangDialectId(Number(e.target.value));
            onChange(data);
          }}
        >
          {Object.entries(LangDialects).map(([id, name]) => (
            <MenuItem key={id} value={id}>
              {name}
            </MenuItem>
          ))}
        </Select>
        <Select
          size="small"
          variant="standard"
          value={allSources.find((s) => s.getId() === data.getSourceId())?.getId() || ''}
          sx={(theme) => ({
            flex: 1,
            minWidth: 200,
            maxWidth: 200,
            width: '90%',
            fontSize: '0.875rem',
            color: theme.palette.text.secondary,
          })}
          onChange={(e) => {
            data.setSourceId(e.target.value);
            onChange(data);
          }}
        >
          {allSources.map((source) => (
            <MenuItem key={source.getId()} value={source.getId()}>
              {`${source.getName()} — (${source.getAuthors()})`}
            </MenuItem>
          ))}
        </Select>
        <Box sx={{ width: '100%' }} />
        <IconButton size="small" onClick={onDelete} color="error" sx={{ alignSelf: 'flex-end' }}>
          <DeleteOutlineIcon fontSize="small" />
        </IconButton>
      </Box>
      <Stack direction="row" gap={2}>
        <Box
          gap={1}
          sx={(theme) => ({
            display: 'flex',
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
          <Box mt={1} display="flex" alignItems="center" gap={1} flexWrap="wrap">
            {data
              .getTags()
              ?.map((t) => (
                <Chip
                  key={t}
                  label={tagEntries[t.split(';')[0]]}
                  size="small"
                  onDelete={() => patch({ tags: data.getTags()?.filter((x) => x !== t) })}
                />
              ))}
            <Chip
              label="tags"
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
              selected={data.getTags() ?? []}
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
            value={data.getInflection()}
            onChange={(e) => patch({ inflection: e.target.value })}
            sx={{ maxWidth: 200, width: '100%' }}
          />
        </Box>
        <Box sx={{ width: '100%' }} />
      </Stack>
      {/* definitions */}
      {data.getDefinitions().map((d, i) => (
        <Box key={i}>
          <Divider sx={{ mt: 1.5 }} />
          <DefinitionBlock
            idx={i}
            def={d}
            onChange={(def) => updateDef(i, def)}
            onDelete={() => deleteDef(i)}
            tagEntries={tagEntries}
            allTags={allTags}
            wordLangDialectId={wordLangDialectId}
            definitionsLangDialectId={data.getLangDialectId()}
          />
        </Box>
      ))}

      {/* word‑detail examples */}
      {data.getExamples() && data.getExamples()!.length > 0 && (
        <Box sx={{ mt: 1 }}>
          <Divider sx={{ mt: 1.5, mb: 1 }} />
          <Typography variant="subtitle2" color="text.secondary">
            other examples
          </Typography>
        </Box>
      )}
      {data.getExamples()?.map((ex, i) => (
        <ExampleLine
          key={i}
          example={ex}
          isInnerBlockExample={false}
          onChange={(v) => {
            const copy = [...(data.getExamples() ?? [])];
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
        <AddButtonsMenu
          addDefinition={() =>
            patch({ definitions: [...data.getDefinitions(), DefinitionModel.createEmpty()] })
          }
          addOtherExamples={() =>
            patch({
              examples: [
                ...(data.getExamples() ?? []),
                TranslationModel.createEmpty([wordLangDialectId, data.getLangDialectId()]),
              ],
            })
          }
        />
      </Box>
    </Box>
  );
};

const AddButtonsMenu: React.FC<{ addDefinition: () => void; addOtherExamples: () => void }> = ({
  addDefinition,
  addOtherExamples,
}) => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <div>
      <Button
        variant="contained"
        size="small"
        color="info"
        sx={{
          ...BUTTON_PASTEL_COLORS_BLUE,
        }}
        onClick={handleClick}
        // endIcon={<AddIcon />}
        startIcon={<ArrowDropDownIcon />}
      >
        Add
      </Button>
      <Menu
        id="basic-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        slotProps={{
          list: {
            'aria-labelledby': 'basic-button',
          },
        }}
      >
        <MenuItem
          onClick={() => {
            addDefinition();
            handleClose();
          }}
        >
          Definition
        </MenuItem>
        <MenuItem
          onClick={() => {
            addOtherExamples();
            handleClose();
          }}
        >
          Other examples
        </MenuItem>
      </Menu>
    </div>
  );
};

/* ------------- SpellingVariants -------------- */
const SpellingVariants: React.FC<{
  word: WordModel;
  onAdd: () => void;
  onUpdate: (i: number, sv: SpellingVariantModel) => void;
  onDelete: (i: number) => void;
  allSources: SourceModel[];
}> = ({ word, onAdd, onUpdate, onDelete, allSources }) => {
  const spellingVariants: SpellingVariantModel[] = word.getSpellingVariants();
  console.log('spellingVariants', spellingVariants);
  const wordLangIsoCode = IdToLang[word.getLangDialectId()];
  const allDialectIdsForLang = LangToId[wordLangIsoCode];
  const allDialectsForLang = Object.entries(LangDialects).filter(([id, name]) => {
    return allDialectIdsForLang.indexOf(parseInt(id)) != -1;
  });
  return (
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
        <Chip
          label="variant"
          icon={<AddIcon />}
          variant="filled"
          size="small"
          color="info"
          sx={{
            ...BUTTON_PASTEL_COLORS_BLUE,
          }}
          onClick={onAdd}
        />
      </Box>

      {spellingVariants.map((spellingVariant, i) => (
        <Box
          key={`ld_${spellingVariant.getId()}_i_${i}`}
          sx={{
            display: 'flex',
            flex: 1,
            width: '100%',
            flexDirection: 'row',
            alignItems: 'end',
            gap: 3,
          }}
        >
          <TextField
            key={`ld_${spellingVariant.getId()}_phrase_i_${i}`}
            variant="standard"
            value={spellingVariant.getSpelling()}
            onChange={(e) => {
              spellingVariant.setSpelling(e.target.value);
              onUpdate(i, spellingVariant);
            }}
            placeholder="word variant"
            sx={{
              minWidth: '31%',
              '& .MuiInput-root': {
                ...expressionFont.style,
                // fontWeight: 'bold',
                pl: 1,
              },
            }}
            autoComplete="off"
            slotProps={{
              input: {
                disableUnderline: true,
                style: { borderBottom: '1px dashed #000' },
              },
            }}
          />
          <Select
            size="small"
            variant="standard"
            value={spellingVariant.getLangDialectId()}
            sx={(theme) => ({
              flex: 1,
              fontSize: '0.875rem',
              color: theme.palette.text.secondary,
              minWidth: 200,
              maxWidth: 200,
            })}
            onChange={(e) => {
              spellingVariant.setLangDialectId(e.target.value);
              onUpdate(i, spellingVariant);
            }}
          >
            {allDialectsForLang.map(([id, name]) => (
              <MenuItem key={id} value={id}>
                {name}
              </MenuItem>
            ))}
          </Select>
          <Select
            size="small"
            variant="standard"
            value={
              allSources.find((s) => s.getId() === spellingVariant.getSourceId())?.getId() || ''
            }
            sx={(theme) => ({
              flex: 1,
              fontSize: '0.875rem',
              color: theme.palette.text.secondary,
              width: '90%',
              maxWidth: 275,
            })}
            onChange={(e) => {
              spellingVariant.setSourceId(e.target.value);
              onUpdate(i, spellingVariant);
            }}
          >
            {allSources.map((source) => (
              <MenuItem key={source.getId()} value={source.getId()}>
                {`${source.getName()} — (${source.getAuthors()})`}
              </MenuItem>
            ))}
          </Select>
          <IconButton
            size="small"
            onClick={() => {
              onDelete(i);
            }}
            color="error"
          >
            <DeleteOutlineIcon fontSize="small" />
          </IconButton>
        </Box>
      ))}
    </Box>
  );
};

/* ---------------- Entry ---------------- */
const WordEntry: React.FC<{
  idx: number;
  entry: WordModel;
  onChange: (e: WordModel) => void;
  onDelete: () => void;
  lang: WebsiteLang;
  defLangDialectId: number;
  defSourceId: number;
  allSources: SourceModel[];
  isFirst?: boolean;
  isLast?: boolean;
}> = ({
  idx,
  entry: wordEntry,
  onChange,
  onDelete,
  lang,
  defLangDialectId,
  defSourceId,
  allSources,
  isFirst,
  isLast,
}) => {
  // const theme = useTheme();
  // const isMdDownSize = useMediaQuery(theme.breakpoints.down('md'));
  const [showCannotDeleteMessage, setShowCannotDeleteMessage] = React.useState(false);
  const [isOpen, setIsOpen] = React.useState(false);
  const toggleOpen = () => {
    setIsOpen(!isOpen);
  };
  // Spelling variants handling
  const addSV = () => {
    const lastDialectId =
      wordEntry.getSpellingVariants().at(-1)?.getLangDialectId() ?? wordEntry.getLangDialectId();
    const wordLangIsoCode = IdToLang[wordEntry.getLangDialectId()];
    const allDialectIdsForLang = LangToId[wordLangIsoCode];
    const nextDialectId =
      lastDialectId === allDialectIdsForLang.at(-1) ? lastDialectId : lastDialectId + 1;
    onChange(
      wordEntry.merge({
        spellingVariants: [
          ...(wordEntry.getSpellingVariants() ?? []),
          SpellingVariantModel.createEmpty(nextDialectId, wordEntry.getSourceId()),
        ],
      }),
    );
  };
  const updateSV = (i: number, sv: SpellingVariantModel) => {
    onChange(
      wordEntry.merge({
        spellingVariants: wordEntry.getSpellingVariants().map((s, idx) => (idx === i ? sv : s)),
      }),
    );
  };
  const deleteSV = (i: number) => {
    onChange(
      wordEntry.merge({
        spellingVariants: wordEntry.getSpellingVariants().filter((_, idx) => idx !== i),
      }),
    );
  };
  // Word details handling
  const addWD = () => {
    onChange(
      wordEntry.merge({
        wordDetails: [
          ...wordEntry.getWordDetails(),
          WordDetailModel.createEmpty(defLangDialectId, defSourceId),
        ],
      }),
    );
    // setIsOpen(true);
  };
  const updateWD = (i: number, wd: WordDetailModel) =>
    onChange(
      wordEntry.merge({
        wordDetails: wordEntry.getWordDetails().map((w, idx) => (idx === i ? wd : w)),
      }),
    );
  const deleteWD = (i: number) => {
    if (wordEntry.getWordDetails().length > 1) {
      onChange(
        wordEntry.merge({ wordDetails: wordEntry.getWordDetails().filter((_, idx) => idx !== i) }),
      );
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
      <Box
        display="flex"
        alignItems="flex-end"
        sx={{ width: '100%', bgcolor: isOpen ? 'unset' : INPUT_PASTEL_BEIGE }}
      >
        <IconButton size="small" onClick={toggleOpen}>
          {isOpen ? <ExpandLessIcon /> : <ExpandMoreIcon />}
        </IconButton>
        <TextField
          variant="standard"
          value={wordEntry.getSpelling()}
          required
          placeholder="word *"
          slotProps={{
            input: {
              disableUnderline: !isOpen,
              // It works buggy on MUI, so skipping for now
              // onInvalid: (e) =>
              //   (e.target as HTMLInputElement).setCustomValidity('Word cannot be empty'),
            },
          }}
          autoComplete="off"
          onChange={(e) => onChange(wordEntry.merge({ spelling: e.target.value }))}
          sx={{
            minWidth: '30%',
            bgcolor: INPUT_PASTEL_BEIGE,
            '& .MuiInput-root': {
              ...expressionFont.style,
              fontWeight: 'bold',
              pl: 1,
            },
          }}
        />
        <Box sx={{ height: '34px', p: '5px 0', borderRight: isOpen ? 'unset' : '1px solid #333' }}>
          {/* {entry.open && <Typography>:</Typography>} */}
        </Box>
        {!isOpen ? (
          <TextField
            variant="standard"
            fullWidth
            sx={{ bgcolor: INPUT_PASTEL_BEIGE, '& .MuiInputBase-root': { pl: 1 } }}
            value={wordEntry.getWordDetails()[0].getDefinitions()[0].getValue()}
            required
            placeholder="definition *"
            slotProps={{
              input: {
                disableUnderline: !isOpen,
                // It works buggy on MUI, so skipping for now
                // onInvalid: (e) => {
                //   console.log('Definition cannot be empty', e);
                //   (e.target as HTMLInputElement).setCustomValidity('Definition cannot be empty');
                // },
              },
            }}
            autoComplete="off"
            onChange={(e) => {
              const copy = wordEntry.getCopy();
              copy.getWordDetails()[0].getDefinitions()[0].setValue(e.target.value);
              onChange(copy);
            }}
          />
        ) : (
          // <div style={{ flex: 1, width: '100%' }} />
          <Box
            sx={(theme) => ({
              ml: 3,
              display: 'flex',
              width: '100%',
              flexDirection: 'row',
              alignItems: 'center',
              gap: 3,
              [theme.breakpoints.down('md')]: {
                flexDirection: 'column',
                alignItems: 'flex-start',
                gap: 1,
              },
            })}
          >
            <Select
              size="small"
              variant="standard"
              value={wordEntry.getLangDialectId()}
              sx={(theme) => ({
                flex: 1,
                fontSize: '0.875rem',
                color: theme.palette.text.secondary,
                maxWidth: 200,
              })}
              onChange={(e) => {
                wordEntry.setLangDialectId(Number(e.target.value));
                onChange(wordEntry);
              }}
            >
              {Object.entries(LangDialects).map(([id, name]) => (
                <MenuItem key={id} value={id}>
                  {name}
                </MenuItem>
              ))}
            </Select>
            <Select
              size="small"
              variant="standard"
              value={allSources.find((s) => s.getId() === wordEntry.getSourceId())?.getId() || ''}
              sx={(theme) => ({
                flex: 1,
                fontSize: '0.875rem',
                color: theme.palette.text.secondary,
                width: '90%',
                maxWidth: 275,
              })}
              onChange={(e) => {
                wordEntry.setSourceId(e.target.value);
                onChange(wordEntry);
              }}
            >
              {allSources.map((source) => (
                <MenuItem key={source.getId()} value={source.getId()}>
                  {`${source.getName()} — (${source.getAuthors()})`}
                </MenuItem>
              ))}
            </Select>
          </Box>
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
            Cannot delete the only definition group
          </Alert>
        </Snackbar>
      </Box>

      {/* collapsible */}
      {isOpen && (
        <Box mt={1} pb={1} pl={5}>
          <SpellingVariants
            word={wordEntry}
            onAdd={addSV}
            onUpdate={updateSV}
            onDelete={deleteSV}
            allSources={allSources}
          />
          {wordEntry.getWordDetails().map((wd, i) => (
            <WordDetailBlock
              key={i}
              data={wd}
              onChange={(d) => updateWD(i, d)}
              onDelete={() => deleteWD(i)}
              lang={lang}
              allSources={allSources}
              wordLangDialectId={wordEntry.getLangDialectId()}
            />
          ))}
          <Button
            variant="contained"
            size="small"
            startIcon={<AddIcon />}
            onClick={addWD}
            sx={{ mt: 1, ml: 1.5, ...BUTTON_PASTEL_COLORS_BLUE }}
          >
            definition group
          </Button>
        </Box>
      )}
    </Box>
  );
};

/* ---------------- Root component ---------------- */
export const WordEntryForm: React.FC<{ lang: WebsiteLang; sourceModels: SourceModelType[] }> = ({
  lang,
  sourceModels,
}) => {
  const { t } = useTranslation(lang);
  const langs = t('languages', { ns: 'common', returnObjects: true }) as Record<
    DictionaryLang,
    string
  >;
  const [alertMessage, setAlertMessage] = useState<
    { message: string; severity: 'error' | 'info' | 'success' | 'warning' } | undefined
  >(undefined);
  const addEntryButtonRef = useRef<HTMLButtonElement>(null);
  const [fromLangDialectId, setFromLangDialectId] = useState<number>(1);
  const [toLangDialectId, setToLangDialectId] = useState<number>(25);
  // Sources
  const [sources, setSources] = useState<SourceModel[]>(
    sourceModels.map((smt) => new SourceModel(smt)) || [],
  );
  const [selectedSource, setSelectedSource] = useState<SourceModel>(sources[0]);
  // Entries
  const wordMeta = { langDialectId: fromLangDialectId, sourceId: selectedSource.getId()! };
  const defMeta = { langDialectId: toLangDialectId, sourceId: selectedSource.getId()! };
  const [entries, setEntries] = useState<WordModel[]>([WordModel.createEmpty(wordMeta, defMeta)]);
  const addEntry = () => {
    setEntries((prev) => [...prev, WordModel.createEmpty(wordMeta, defMeta)]);
    addEntryButtonRef.current?.scrollIntoView({ block: 'start' });
  };
  const updateEntry = (i: number, e: WordModel) =>
    setEntries((prev) => prev.map((en, idx) => (idx === i ? e : en)));
  const deleteEntry = (i: number) => {
    if (!entries[i].isEmpty()) {
      const answer = confirm('Are you sure you want to delete this entry?');
      if (!answer) {
        return;
      }
    }
    setEntries((prev) => {
      if (prev.length > 1) {
        return prev.filter((_, idx) => idx !== i);
      }
      return prev;
    });
  };
  const handleCreate = (created: SourceModel) => {
    // Persist locally (or via API)
    setSources((prev) => [...prev, created]);
  };
  return (
    <Box
      component="form"
      // Prevent reloading page on submit
      onSubmit={(e) => e.preventDefault()}
      sx={(theme) => ({ maxWidth: 1200, [theme.breakpoints.down('md')]: { ml: 1.5 } })}
    >
      {/* header + selectors */}
      <Grid container columns={{ xs: 6 }} gap={1} mb={5}>
        <Grid size={{ xs: 6 }} display="flex" alignItems="center" gap={1}>
          <SourcesCreatableSelect
            label="📚 Source"
            options={sources}
            value={selectedSource}
            onChange={setSelectedSource}
            onCreate={handleCreate}
            placeholder="Choose or add"
          />
        </Grid>
        <Grid size={{ xs: 6 }} display="flex" alignItems="center" gap={1}>
          <Select
            size="small"
            value={fromLangDialectId}
            sx={{ flex: 1 }}
            onChange={(e) => setFromLangDialectId(Number(e.target.value))}
          >
            {Object.entries(LangDialects).map(([id, name]) => (
              <MenuItem key={id} value={id}>
                {name}
              </MenuItem>
            ))}
          </Select>
          <Typography>→</Typography>
          <Select
            size="small"
            value={toLangDialectId}
            sx={{ flex: 1 }}
            onChange={(e) => setToLangDialectId(Number(e.target.value))}
          >
            {Object.entries(LangDialects).map(([id, name]) => (
              <MenuItem key={id} value={id}>
                {name}
              </MenuItem>
            ))}
          </Select>
        </Grid>
      </Grid>

      {entries.map((en, idx) => (
        <WordEntry
          key={idx}
          idx={idx + 1}
          entry={en}
          onChange={(e) => updateEntry(idx, e)}
          onDelete={() => deleteEntry(idx)}
          lang={lang}
          defLangDialectId={toLangDialectId}
          defSourceId={selectedSource.getId()!}
          allSources={sources}
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
        sx={{ mt: '4px', mb: 3, ...BUTTON_PASTEL_COLORS_BLUE }}
      >
        Gaf
      </Button>
      {/* live json */}
      <Box mt={2} mb={2}>
        <Button
          type="submit"
          variant="contained"
          size="small"
          startIcon={<SaveIcon />}
          onClick={async () => {
            const proposalValue = new DictionaryProposalModel(
              entries.filter((e) => !e.isEmpty()),
              selectedSource,
            );
            if (proposalValue.entries.length === 0) {
              setAlertMessage({ message: 'Nothing to save', severity: 'info' });
              return;
            }
            if (entries.filter((e) => e.isIncomplete()).length > 0) {
              setAlertMessage({ message: 'Missing required values', severity: 'error' });
              return;
            }
            try {
              await fetch('add-word/api', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(proposalValue),
              });
              setAlertMessage({ message: 'Saved successfully', severity: 'success' });
            } catch (error) {
              console.error('Error saving proposal:', error);
              setAlertMessage({ message: 'Failed to save', severity: 'error' });
            }
          }}
          sx={{ mt: '4px', mb: 3 }}
        >
          Send to review
        </Button>
        {/* <Typography fontWeight={600} variant="subtitle1">
          Live JSON
        </Typography>
        <pre
          style={{
            background: '#fafaf8',
            border: '1px solid #ecece6',
            padding: '0.8rem',
            overflowX: 'scroll',
          }}
        >
          {JSON.stringify(new DictionaryProposalModel(entries, selectedSource), null, 2)}
        </pre> */}
      </Box>
      <Snackbar
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        open={alertMessage !== undefined}
        autoHideDuration={6000}
        onClose={() => setAlertMessage(undefined)}
      >
        <Alert severity={alertMessage?.severity} variant="filled" sx={{ width: '100%' }}>
          {alertMessage?.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};
