'use client';
import React, { memo, useReducer, useRef, useState } from 'react';
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
import { capitalizeFirstLetter, flipAndMergeTags } from '@/search/definition/utils';
import { DictionaryLang, WebsiteLang } from '@api/types.model';
import { SourcesCreatableSelect } from '../../components/SearchableCreatableSelect';
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
} from '../../models/proposal.model';
import { LangDialects } from '@repository/constants';
import { SpellingVariant } from '@repository/entities/SpellingVariant';
import { IdToLang, LangToId } from '@api/languages';
import { langDialectIdToString } from '../../utils';

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
  lang: WebsiteLang;
}
const TagSelector: React.FC<TagSelectorProps> = ({
  anchorEl,
  selected,
  onClose,
  onChange,
  allTags,
  lang,
}) => {
  const { t } = useTranslation(lang);
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
          placeholder={t('addNewWord.searchTag', { ns: 'dashboard' })}
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

/* ---------------- WordDetailBlock ---------------- */
const WordDetailBlock: React.FC<{
  data: WordDetailModel;
  onChange: (wd: WordDetailModel) => void;
  onDelete: () => void;
  lang: WebsiteLang;
  allSources: SourceModel[];
  wordLangDialectId: number;
  readonly: boolean;
}> = ({ data, onChange, onDelete, lang, allSources, wordLangDialectId, readonly = false }) => {
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
          {t('addNewWord.messages.cannotDeleteOnlyDefinition', { ns: 'dashboard' })}
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
          inputProps={{ readOnly: readonly }}
        >
          {Object.entries(LangDialects).map(([id, name]) => (
            <MenuItem key={id} value={id}>
              {langDialectIdToString(parseInt(id), t)}
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
          inputProps={{ readOnly: readonly }}
        >
          {allSources.map((source) => (
            <MenuItem key={source.getId()} value={source.getId()}>
              {`${source.getName()} — (${source.getAuthors()})`}
            </MenuItem>
          ))}
        </Select>
        <Box sx={{ width: '100%' }} />
        {!readonly && (
          <IconButton size="small" onClick={onDelete} color="error" sx={{ alignSelf: 'flex-end' }}>
            <DeleteOutlineIcon fontSize="small" />
          </IconButton>
        )}
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
                  onDelete={
                    readonly
                      ? undefined
                      : () => patch({ tags: data.getTags()?.filter((x) => x !== t) })
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
                  selected={data.getTags() ?? []}
                  onClose={() => setAnchor(null)}
                  onChange={(tags) => patch({ tags })}
                  allTags={allTags}
                  lang={lang}
                />
              </>
            )}
          </Box>
          {/* inflection */}
          {!(
            readonly &&
            (data.getInflection() === undefined || data.getInflection()?.trim() === '')
          ) && (
            <TextField
              variant="standard"
              placeholder={t('addNewWord.inflection', { ns: 'dashboard' })}
              autoComplete="off"
              value={data.getInflection()}
              onChange={(e) => patch({ inflection: e.target.value })}
              sx={{ minWidth: 200, width: '100%' }}
              slotProps={{
                input: { readOnly: readonly },
              }}
            />
          )}
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
            lang={lang}
            readonly={readonly}
          />
        </Box>
      ))}

      {/* word‑detail examples */}
      {data.getExamples() && data.getExamples()!.length > 0 && (
        <Box sx={{ mt: 1 }}>
          <Divider sx={{ mt: 1.5, mb: 1 }} />
          <Typography variant="subtitle2" color="text.secondary">
            {t('addNewWord.otherExamples', { ns: 'dashboard' })}
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
          lang={lang}
          readonly={readonly}
        />
      ))}

      {/* controls */}
      {!readonly && (
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
            lang={lang}
          />
        </Box>
      )}
    </Box>
  );
};

const AddButtonsMenu: React.FC<{
  addDefinition: () => void;
  addOtherExamples: () => void;
  lang: WebsiteLang;
}> = ({ addDefinition, addOtherExamples, lang }) => {
  const { t } = useTranslation(lang);
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
        {t('addNewWord.add', { ns: 'dashboard' })}
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
          {capitalizeFirstLetter(t('addNewWord.definition', { ns: 'dashboard' }))}
        </MenuItem>
        <MenuItem
          onClick={() => {
            addOtherExamples();
            handleClose();
          }}
        >
          {capitalizeFirstLetter(t('addNewWord.otherExamples', { ns: 'dashboard' }))}
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
  lang: WebsiteLang;
  readonly: boolean;
}> = ({ word, onAdd, onUpdate, onDelete, allSources, lang, readonly = false }) => {
  const { t } = useTranslation(lang);
  const spellingVariants: SpellingVariantModel[] = word.getSpellingVariants();
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
          <Chip
            label={t('addNewWord.variant', { ns: 'dashboard' })}
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
      )}

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
            placeholder={t('addNewWord.wordVariant', { ns: 'dashboard' })}
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
                readOnly: readonly,
              },
            }}
          />
          {allDialectsForLang.length > 1 && (
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
              inputProps={{ readOnly: readonly }}
            >
              {allDialectsForLang.map(([id, name]) => (
                <MenuItem key={id} value={id}>
                  {langDialectIdToString(parseInt(id), t, { showOnlyDialect: true })}
                </MenuItem>
              ))}
            </Select>
          )}
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
            inputProps={{ readOnly: readonly }}
          >
            {allSources.map((source) => (
              <MenuItem key={source.getId()} value={source.getId()}>
                {`${source.getName()} — (${source.getAuthors()})`}
              </MenuItem>
            ))}
          </Select>
          {!readonly && (
            <IconButton
              size="small"
              onClick={() => {
                onDelete(i);
              }}
              color="error"
            >
              <DeleteOutlineIcon fontSize="small" />
            </IconButton>
          )}
        </Box>
      ))}
    </Box>
  );
};

/* ---------------- Entry ---------------- */
// TODO: optimize by adding custom `arePropsEqual` function to memo
//       memo isn't working as intended because of unoptimized onChange
export const WordEntry: React.FC<{
  idx: number;
  wordEntry: WordModel;
  onChange: (e: WordModel) => void;
  onDelete: () => void;
  lang: WebsiteLang;
  defLangDialectId: number;
  defSourceId: number;
  allSources: SourceModel[];
  isFirst?: boolean;
  isLast?: boolean;
  readonly: boolean;
}> = ({
  idx,
  wordEntry: wordEntryRef,
  onChange,
  onDelete,
  lang,
  defLangDialectId,
  defSourceId,
  allSources,
  isFirst,
  isLast,
  readonly = false,
}) => {
  const { t } = useTranslation(lang);
  const [wordEntry, setWordEntry] = useState(wordEntryRef);
  const [showCannotDeleteMessage, setShowCannotDeleteMessage] = React.useState(false);
  const [isOpen, setIsOpen] = React.useState(false);
  const toggleOpen = () => {
    setIsOpen(!isOpen);
  };
  const firstDefinitionValues = wordEntry.getWordDetails()[0].getDefinitions()[0]?.getValues() ?? [
    { value: '' },
  ];
  // Spelling variants handling
  const addSV = () => {
    const copyWordEntry = wordEntry.getCopy();
    const lastDialectId =
      copyWordEntry.getSpellingVariants().at(-1)?.getLangDialectId() ??
      copyWordEntry.getLangDialectId();
    const wordLangIsoCode = IdToLang[copyWordEntry.getLangDialectId()];
    const allDialectIdsForLang = LangToId[wordLangIsoCode];
    const nextDialectId =
      lastDialectId === allDialectIdsForLang.at(-1) ? lastDialectId : lastDialectId + 1;

    copyWordEntry.merge({
      spellingVariants: [
        ...(copyWordEntry.getSpellingVariants() ?? []),
        SpellingVariantModel.createEmpty(nextDialectId, copyWordEntry.getSourceId()),
      ],
    });
    setWordEntry(copyWordEntry);
    onChange(copyWordEntry);
  };
  const updateSV = (i: number, sv: SpellingVariantModel) => {
    const copyWordEntry = wordEntry.getCopy();
    copyWordEntry.merge({
      spellingVariants: copyWordEntry.getSpellingVariants().map((s, idx) => (idx === i ? sv : s)),
    });
    setWordEntry(copyWordEntry);
    onChange(copyWordEntry);
  };
  const deleteSV = (i: number) => {
    const copyWordEntry = wordEntry.getCopy();
    copyWordEntry.merge({
      spellingVariants: copyWordEntry.getSpellingVariants().filter((_, idx) => idx !== i),
    });
    setWordEntry(copyWordEntry);
    onChange(copyWordEntry);
  };
  // Word details handling
  const addWD = () => {
    const copyWordEntry = wordEntry.getCopy();
    copyWordEntry.merge({
      wordDetails: [
        ...copyWordEntry.getWordDetails(),
        WordDetailModel.createEmpty(defLangDialectId, defSourceId),
      ],
    });
    setWordEntry(copyWordEntry);
    onChange(copyWordEntry);
    // setIsOpen(true);
  };
  const updateWD = (i: number, wd: WordDetailModel) => {
    const copyWordEntry = wordEntry.getCopy();
    copyWordEntry.merge({
      wordDetails: copyWordEntry.getWordDetails().map((w, idx) => (idx === i ? wd : w)),
    });
    setWordEntry(copyWordEntry);
    onChange(copyWordEntry);
  };
  const deleteWD = (i: number) => {
    const copyWordEntry = wordEntry.getCopy();
    if (copyWordEntry.getWordDetails().length > 1) {
      copyWordEntry.merge({
        wordDetails: copyWordEntry.getWordDetails().filter((_, idx) => idx !== i),
      });
      setWordEntry(copyWordEntry);
      onChange(copyWordEntry);
    } else {
      setShowCannotDeleteMessage(true);
    }
  };

  // WordEntry stats
  // adding 1 because we have one default spelling always
  const wordVariantsAmount = wordEntry.getSpellingVariants().length + 1;
  const wordDetailsAmount = wordEntry.getWordDetails().length;
  const definitionsAmount = wordEntry
    .getWordDetails()
    .reduce((acc, wd) => acc + wd.getDefinitions().length, 0);
  const examplesAmount =
    wordEntry.getWordDetails().reduce((acc, wd) => acc + (wd.getExamples()?.length || 0), 0) +
    wordEntry
      .getWordDetails()
      .reduce(
        (acc, wd) =>
          acc +
          wd.getDefinitions().reduce((defAcc, def) => defAcc + (def.getExamples()?.length || 0), 0),
        0,
      );
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
        sx={{
          width: '100%',
          bgcolor: isOpen ? 'unset' : INPUT_PASTEL_BEIGE,
          borderBottom: isOpen ? 'unset' : '1px solid #ccc',
        }}
      >
        <IconButton size="small" onClick={toggleOpen}>
          {isOpen ? <ExpandLessIcon /> : <ExpandMoreIcon />}
        </IconButton>
        <TextField
          variant="standard"
          value={wordEntry.getSpelling()}
          required
          placeholder={`${t('addNewWord.word', { ns: 'dashboard' })} *`}
          slotProps={{
            input: {
              disableUnderline: !isOpen,
              readOnly: readonly,
              // It works buggy on MUI, so skipping for now
              // onInvalid: (e) =>
              //   (e.target as HTMLInputElement).setCustomValidity('Word cannot be empty'),
            },
          }}
          autoComplete="off"
          onChange={(e) => {
            const copyWordEntry = wordEntry.getCopy();
            copyWordEntry.merge({ spelling: e.target.value });
            setWordEntry(copyWordEntry);
            onChange(copyWordEntry);
          }}
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
            sx={{
              bgcolor: INPUT_PASTEL_BEIGE,
              '& .MuiInputBase-root': { pl: 1 },
            }}
            value={firstDefinitionValues[0].value}
            required
            placeholder={`${t('addNewWord.definition', { ns: 'dashboard' })} *`}
            slotProps={{
              input: {
                disableUnderline: !isOpen,
                readOnly: readonly,
                // It works buggy on MUI, so skipping for now
                // onInvalid: (e) => {
                //   console.log('Definition cannot be empty', e);
                //   (e.target as HTMLInputElement).setCustomValidity('Definition cannot be empty');
                // },
              },
            }}
            autoComplete="off"
            onChange={(e) => {
              const copyWordEntry = wordEntry.getCopy();
              firstDefinitionValues[0].value = e.target.value;
              copyWordEntry
                .getWordDetails()[0]
                .getDefinitions()[0]
                .setValues(firstDefinitionValues);
              setWordEntry(copyWordEntry);
              onChange(copyWordEntry);
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
                const copyWordEntry = wordEntry.getCopy();
                copyWordEntry.setLangDialectId(Number(e.target.value));
                setWordEntry(copyWordEntry);
                onChange(copyWordEntry);
              }}
              inputProps={{ readOnly: readonly }}
            >
              {Object.entries(LangDialects).map(([id, name]) => (
                <MenuItem key={id} value={id}>
                  {/* {name} */}
                  {langDialectIdToString(parseInt(id), t)}
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
                const copyWordEntry = wordEntry.getCopy();
                copyWordEntry.setSourceId(e.target.value);
                setWordEntry(copyWordEntry);
                onChange(copyWordEntry);
              }}
              inputProps={{ readOnly: readonly }}
            >
              {allSources.map((source) => (
                <MenuItem key={source.getId()} value={source.getId()}>
                  {`${source.getName()} — (${source.getAuthors()})`}
                </MenuItem>
              ))}
            </Select>
          </Box>
        )}
        {!readonly && (
          <IconButton size="small" onClick={onDelete} sx={{ alignSelf: 'flex-end' }} color="error">
            <DeleteIcon fontSize="small" />
          </IconButton>
        )}
        <Snackbar
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
          open={showCannotDeleteMessage}
          autoHideDuration={6000}
          onClose={() => setShowCannotDeleteMessage(false)}
        >
          <Alert severity="error" variant="filled" sx={{ width: '100%' }}>
            {t('addNewWord.messages.cannotDeleteOnlyDefinitionGroup', { ns: 'dashboard' })}
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
            lang={lang}
            readonly={readonly}
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
              readonly={readonly}
            />
          ))}
          {!readonly && (
            <Button
              variant="contained"
              size="small"
              startIcon={<AddIcon />}
              onClick={addWD}
              sx={{ mt: 1, ml: 1.5, ...BUTTON_PASTEL_COLORS_BLUE }}
            >
              {t('addNewWord.definitionGroup', { ns: 'dashboard' })}
            </Button>
          )}
        </Box>
      )}
      <Box sx={{ display: 'flex', flexDirection: 'row', p: 0.5, gap: 1 }}>
        <Typography variant="caption" color="text.secondary">
          {t('addNewWord.stats.wordVariants', { ns: 'dashboard' }) + ': '}
          <b>{wordVariantsAmount}</b>
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {/* {t('addNewWord.spellingVariants', { ns: 'dashboard' })} */}
          {t('addNewWord.stats.definitionGroups', { ns: 'dashboard' }) + ': '}
          <b>{wordDetailsAmount}</b>
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {/* {t('addNewWord.spellingVariants', { ns: 'dashboard' })} */}
          {t('addNewWord.stats.definitions', { ns: 'dashboard' }) + ': '}
          <b>{definitionsAmount}</b>
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {/* {t('addNewWord.spellingVariants', { ns: 'dashboard' })} */}
          {t('addNewWord.stats.examples', { ns: 'dashboard' }) + ': '}
          <b>{examplesAmount}</b>
        </Typography>
      </Box>
    </Box>
  );
};

/* ---------------- Root component ---------------- */
export const WordEntryForm: React.FC<{
  lang: WebsiteLang;
  sourceModels: SourceModelType[];
  readonly: boolean;
  dictionaryModel?: DictionaryProposalModel;
}> = ({ lang, sourceModels, readonly = false, dictionaryModel }) => {
  const { t } = useTranslation(lang);
  // const langs = t('languages', { ns: 'common', returnObjects: true }) as Record<
  //   DictionaryLang,
  //   string
  // >;
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
  const [selectedSource, setSelectedSource] = useState<SourceModel>(
    dictionaryModel ? dictionaryModel.source : sources[0],
  );
  // Entries
  const wordMeta = { langDialectId: fromLangDialectId, sourceId: selectedSource.getId()! };
  const defMeta = { langDialectId: toLangDialectId, sourceId: selectedSource.getId()! };
  // const [entries, setEntries] = useState<WordModel[]>([WordModel.createEmpty(wordMeta, defMeta)]);
  // const addEntry = () => {
  //   setEntries((prev) => [...prev, WordModel.createEmpty(wordMeta, defMeta)]);
  //   addEntryButtonRef.current?.scrollIntoView({ block: 'start' });
  // };
  // const updateEntry = (i: number, e: WordModel) =>
  //   setEntries((prev) => prev.map((en, idx) => (idx === i ? e : en)));
  // const deleteEntry = (i: number) => {
  //   if (!entries[i].isEmpty()) {
  //     const answer = confirm('Are you sure you want to delete this entry?');
  //     if (!answer) {
  //       return;
  //     }
  //   }
  //   setEntries((prev) => {
  //     if (prev.length > 1) {
  //       return prev.filter((_, idx) => idx !== i);
  //     }
  //     return prev;
  //   });
  // };
  // keep the up-to-date entries in a ref
  console.log(
    'dictionaryModel?.entries[0].getWordDetails()',
    dictionaryModel?.entries[0].getWordDetails(),
  );
  const entriesRef = useRef<WordModel[]>(
    dictionaryModel ? dictionaryModel.entries : [WordModel.createEmpty(wordMeta, defMeta)],
  );
  // expose a stable snapshot for render (won’t update unless we forceRender)
  const entries = entriesRef.current;

  // tiny state just to force a render when list length/shape changes
  const [, forceRender] = useReducer((x) => x + 1, 0);

  const addEntry = () => {
    entriesRef.current.push(WordModel.createEmpty(wordMeta, defMeta));
    forceRender(); // show the newly added entry
    // let the DOM update before scrolling
    queueMicrotask(() => {
      addEntryButtonRef.current?.scrollIntoView({ block: 'start' });
    });
  };

  const updateEntry = (i: number, e: WordModel) => {
    // mutate in place so no re-render is triggered
    entriesRef.current[i] = e;
    // intentionally no forceRender(): component won’t re-render here
  };

  const deleteEntry = (i: number) => {
    const list = entriesRef.current;

    if (!list[i].isEmpty()) {
      const answer = confirm('Are you sure you want to delete this entry?');
      if (!answer) return;
    }

    if (list.length > 1) {
      list.splice(i, 1); // mutate in place
      forceRender(); // reflect the removal in the UI
    }
  };
  // const handleCreate = (created: SourceModel) => {
  //   // Persist locally (or via API)
  //   setSources((prev) => [...prev, created]);
  // };
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
            label={`📚 ${t('addNewWord.source', { ns: 'dashboard' })}`}
            options={sources}
            value={selectedSource}
            lang={lang}
            onChange={setSelectedSource}
            readonly={readonly}
            // Creating new source here adds complexity for proposal reviews
            // Better to create in different place, review, approve and then use here only DB values
            // onCreate={handleCreate}
            placeholder="Choose or add"
          />
        </Grid>
        <Grid size={{ xs: 6 }} display="flex" alignItems="center" gap={1}>
          <Select
            size="small"
            value={fromLangDialectId}
            sx={{ flex: 1 }}
            inputProps={{ readOnly: readonly }}
            onChange={(e) => setFromLangDialectId(Number(e.target.value))}
          >
            {Object.entries(LangDialects).map(([id, name]) => (
              <MenuItem key={id} value={id}>
                {langDialectIdToString(parseInt(id), t)}
              </MenuItem>
            ))}
          </Select>
          <Typography>→</Typography>
          <Select
            size="small"
            value={toLangDialectId}
            sx={{ flex: 1 }}
            inputProps={{ readOnly: readonly }}
            onChange={(e) => setToLangDialectId(Number(e.target.value))}
          >
            {Object.entries(LangDialects).map(([id, name]) => (
              <MenuItem key={id} value={id}>
                {langDialectIdToString(parseInt(id), t)}
              </MenuItem>
            ))}
          </Select>
        </Grid>
      </Grid>

      {entries.map((en, idx) => (
        <WordEntry
          key={idx}
          idx={idx + 1}
          wordEntry={en}
          onChange={(e) => updateEntry(idx, e)}
          onDelete={() => deleteEntry(idx)}
          lang={lang}
          defLangDialectId={toLangDialectId}
          defSourceId={selectedSource.getId()!}
          allSources={sources}
          isFirst={idx === 0}
          isLast={idx === entries.length - 1}
          readonly={readonly}
        />
      ))}
      {!readonly && (
        <Button
          ref={addEntryButtonRef}
          variant="contained"
          size="small"
          startIcon={<AddIcon />}
          onClick={addEntry}
          sx={{ mt: '4px', mb: 3, ...BUTTON_PASTEL_COLORS_BLUE }}
        >
          {t('addNewWord.word', { ns: 'dashboard' })}
        </Button>
      )}
      {/* live json */}
      <Box mt={2} mb={2}>
        {!readonly && (
          <Button
            type="submit"
            variant="contained"
            size="small"
            startIcon={<SaveIcon />}
            onClick={async () => {
              const proposalValue = new DictionaryProposalModel(
                entries.filter((e) => !e.isEmpty()),
                selectedSource,
                fromLangDialectId,
                toLangDialectId,
              );
              if (proposalValue.entries.length === 0) {
                setAlertMessage({
                  message: t('addNewWord.messages.nothingToSave', { ns: 'dashboard' }),
                  severity: 'info',
                });
                return;
              }
              if (entries.filter((e) => e.isIncomplete()).length > 0) {
                setAlertMessage({
                  message: t('addNewWord.messages.missingRequiredValues', { ns: 'dashboard' }),
                  severity: 'error',
                });
                return;
              }
              try {
                const result = await fetch('dictionary/api', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(proposalValue),
                });
                if (result.status >= 300) {
                  console.error('Error saving proposal. Something went wrong');
                  setAlertMessage({
                    message: t('addNewWord.messages.failedToSave', { ns: 'dashboard' }),
                    severity: 'error',
                  });
                } else {
                  setAlertMessage({
                    message: t('addNewWord.messages.savedSuccessfully', { ns: 'dashboard' }),
                    severity: 'success',
                  });
                  window.location.reload();
                }
              } catch (error) {
                console.error('Error saving proposal:', error);
                setAlertMessage({
                  message: t('addNewWord.messages.failedToSave', { ns: 'dashboard' }),
                  severity: 'error',
                });
              }
            }}
            sx={{ mt: '4px', mb: 3 }}
          >
            {t('addNewWord.sendToReview', { ns: 'dashboard' })}
          </Button>
        )}
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
          {JSON.stringify(
            new DictionaryProposalModel(
              entries,
              selectedSource,
              fromLangDialectId,
              toLangDialectId,
            ),
            null,
            2,
          )}
        </pre> */}
      </Box>
      <Snackbar
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        open={alertMessage !== undefined}
        autoHideDuration={6000}
        onClose={() => setAlertMessage(undefined)}
      >
        {alertMessage && (
          <Alert severity={alertMessage?.severity} variant="filled" sx={{ width: '100%' }}>
            {alertMessage?.message}
          </Alert>
        )}
      </Snackbar>
    </Box>
  );
};
