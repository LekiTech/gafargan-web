import React, { useCallback, useMemo, useState } from 'react';
import {
  WordModel,
  SourceModel,
  SpellingVariantModel,
  WordDetailModel,
  DefinitionModel,
  STATE,
} from '@/dashboard/models/proposal.model';
import { langDialectIdToString } from '@/dashboard/utils';
import { expressionFont } from '@/fonts';
import { IdToLang, LangToId } from '@api/languages';
import { WebsiteLang } from '@api/types.model';
import {
  Box,
  Typography,
  IconButton,
  TextField,
  Select,
  MenuItem,
  Snackbar,
  Alert,
  Button,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import { LangDialects } from '@repository/constants';
import { useTranslation } from 'react-i18next';
import { INPUT_PASTEL_BEIGE, BUTTON_PASTEL_COLORS_BLUE } from './constants';
import { SpellingVariants } from './SpellingVariants';
import { WordDetailBlock } from './WordDetailBlock';
import { StateChip } from './StateChip';

type WordEntryProps = {
  rowId: string;
  idx: number;
  wordEntry: WordModel;
  onChange: (rowId: string, nextValue: WordModel) => void;
  onDelete: (rowId: string) => void;
  lang: WebsiteLang;
  defLangDialectId: number;
  defSourceId: number;
  allSources: SourceModel[];
  isFirst?: boolean;
  isLast?: boolean;
  readonly: boolean;
};

const WordEntryComponent: React.FC<WordEntryProps> = ({
  rowId,
  idx,
  wordEntry,
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
  const [showCannotDeleteMessage, setShowCannotDeleteMessage] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const dialectOptions = useMemo(
    () =>
      Object.entries(LangDialects).map(([id]) => ({
        id: Number(id),
        label: langDialectIdToString(Number(id), t),
      })),
    [t],
  );

  const sourceOptions = useMemo(
    () =>
      allSources.map((source) => ({
        id: source.getId()!,
        label: `${source.getName()} — (${source.getAuthors()})`,
      })),
    [allSources],
  );

  const firstDefinitionValue = useMemo(() => {
    return wordEntry.getWordDetails()[0]?.getDefinitions()[0]?.getValues()?.[0]?.value ?? '';
  }, [wordEntry]);

  const stats = useMemo(() => {
    const wordDetails = wordEntry.getWordDetails();
    const wordVariantsAmount = wordEntry.getSpellingVariants().length + 1;
    const wordDetailsAmount = wordDetails.length;
    const definitionsAmount = wordDetails.reduce(
      (acc, detail) => acc + detail.getDefinitions().length,
      0,
    );
    const examplesAmount =
      wordDetails.reduce((acc, detail) => acc + (detail.getExamples()?.length || 0), 0) +
      wordDetails.reduce(
        (acc, detail) =>
          acc +
          detail
            .getDefinitions()
            .reduce((defAcc, def) => defAcc + (def.getExamples()?.length || 0), 0),
        0,
      );

    return {
      wordVariantsAmount,
      wordDetailsAmount,
      definitionsAmount,
      examplesAmount,
    };
  }, [wordEntry]);

  const emit = useCallback(
    (nextValue: WordModel) => {
      onChange(rowId, nextValue);
    },
    [onChange, rowId],
  );

  const toggleOpen = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  const handleDelete = useCallback(() => {
    onDelete(rowId);
  }, [onDelete, rowId]);

  const handleSpellingChange = useCallback(
    (value: string) => {
      const clonedWord = wordEntry.getShallowCopy();
      clonedWord.setSpelling(value);
      emit(clonedWord);
    },
    [wordEntry, emit],
  );

  const handleFirstDefinitionChange = useCallback(
    (value: string) => {
      const wordDetails = wordEntry.getWordDetails();
      const firstDetail = wordDetails[0];
      if (!firstDetail) return;

      const definitions = firstDetail.getDefinitions();
      const firstDefinition = definitions[0];
      if (!firstDefinition) return;

      const currentValues = firstDefinition.getValues();
      const nextValues = [...currentValues];
      nextValues[0] = {
        ...(nextValues[0] ?? { value: '' }),
        value,
      };

      const nextFirstDefinition = firstDefinition.getShallowCopy();
      nextFirstDefinition.setValues(nextValues);

      const nextDefinitions = [...definitions];
      nextDefinitions[0] = nextFirstDefinition;

      const nextFirstDetail = firstDetail.getShallowCopy();
      nextFirstDetail.setDefinitions(nextDefinitions);

      const nextWordDetails = [...wordDetails];
      nextWordDetails[0] = nextFirstDetail;

      const clonedWord = wordEntry.getShallowCopy();
      clonedWord.setWordDetails(nextWordDetails);
      emit(clonedWord);
    },
    [wordEntry, emit],
  );

  const handleWordLangDialectChange = useCallback(
    (langDialectId: number) => {
      const clonedWord = wordEntry.getShallowCopy();
      clonedWord.setLangDialectId(langDialectId);
      emit(clonedWord);
    },
    [wordEntry, emit],
  );

  const handleWordSourceChange = useCallback(
    (sourceId: number) => {
      const clonedWord = wordEntry.getShallowCopy();
      clonedWord.setSourceId(sourceId);
      emit(clonedWord);
    },
    [wordEntry, emit],
  );

  const addSV = useCallback(() => {
    const spellingVariants = wordEntry.getSpellingVariants();
    const lastDialectId =
      spellingVariants.at(-1)?.getLangDialectId() ?? wordEntry.getLangDialectId();

    const wordLangIsoCode = IdToLang[wordEntry.getLangDialectId()];
    const allDialectIdsForLang = LangToId[wordLangIsoCode];
    const nextDialectId =
      lastDialectId === allDialectIdsForLang.at(-1) ? lastDialectId : lastDialectId + 1;

    const clonedWord = wordEntry.getShallowCopy();
    clonedWord.setSpellingVariants([
      ...spellingVariants,
      SpellingVariantModel.createEmpty(nextDialectId, wordEntry.getSourceId()),
    ]);
    emit(clonedWord);
  }, [wordEntry, emit]);

  const updateSV = useCallback(
    (i: number, sv: SpellingVariantModel) => {
      const current = wordEntry.getSpellingVariants();
      const next = [...current];
      next[i] = sv;

      const clonedWord = wordEntry.getShallowCopy();
      clonedWord.setSpellingVariants(next);
      emit(clonedWord);
    },
    [wordEntry, emit],
  );

  const deleteSV = useCallback(
    (i: number) => {
      const currentVariants = wordEntry.getSpellingVariants();
      if (currentVariants.length < 1) {
        return;
      }

      const item = currentVariants[i];
      if (!item) {
        return;
      }

      // remove brand new item
      if (!item.getId()) {
        const clonedWord = wordEntry.getShallowCopy();
        clonedWord.setSpellingVariants(currentVariants.filter((_, idx) => idx !== i));
        emit(clonedWord);
        return;
      }

      // mark persisted item as deleted
      const next = [...currentVariants];
      item.markDeleted();
      next[i] = item;

      const clonedWord = wordEntry.getShallowCopy();
      clonedWord.setSpellingVariants(next);
      emit(clonedWord);
    },
    [wordEntry, emit],
  );

  const addWD = useCallback(() => {
    const clonedWord = wordEntry.getShallowCopy();
    clonedWord.setWordDetails([
      ...wordEntry.getWordDetails(),
      WordDetailModel.createEmpty(defLangDialectId, defSourceId),
    ]);
    emit(clonedWord);
  }, [wordEntry, defLangDialectId, defSourceId, emit]);

  const updateWD = useCallback(
    (i: number, wd: WordDetailModel) => {
      const current = wordEntry.getWordDetails();
      const next = [...current];
      next[i] = wd;

      const clonedWord = wordEntry.getShallowCopy();
      clonedWord.setWordDetails(next);
      emit(clonedWord);
    },
    [wordEntry, emit],
  );

  const deleteWD = useCallback(
    (i: number) => {
      const currentDetails = wordEntry.getWordDetails();
      if (currentDetails.length <= 1) {
        setShowCannotDeleteMessage(true);
        return;
      }
      const item = currentDetails[i];
      if (!item) {
        return;
      }

      // remove brand new item
      if (!item.getId()) {
        const clonedWord = wordEntry.getShallowCopy();
        clonedWord.setWordDetails(currentDetails.filter((_, idx) => idx !== i));
        emit(clonedWord);
        return;
      }

      // mark persisted item as deleted
      const next = [...currentDetails];
      item.markDeleted();
      next[i] = item;

      const clonedWord = wordEntry.getShallowCopy();
      clonedWord.setWordDetails(next);
      emit(clonedWord);
    },
    [wordEntry, emit],
  );

  const visibleWordDetails = readonly
    ? wordEntry.getWordDetails()
    : wordEntry.getWordDetails().filter((wd) => !wd.isDeleted());

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

        {readonly && wordEntry.getState() !== STATE.UNCHANGED && (
          <Box sx={{ alignSelf: 'center' }}>
            <StateChip state={wordEntry.getState()} />
          </Box>
        )}

        <TextField
          variant="standard"
          value={wordEntry.getSpelling()}
          required
          placeholder={`${t('addNewWord.word', { ns: 'dashboard' })} *`}
          slotProps={{
            input: {
              disableUnderline: !isOpen,
              readOnly: readonly,
            },
          }}
          autoComplete="off"
          onChange={(e) => handleSpellingChange(e.target.value)}
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

        <Box
          sx={{
            height: '34px',
            p: '5px 0',
            borderRight: isOpen ? 'unset' : '1px solid #333',
          }}
        />

        {!isOpen ? (
          <TextField
            variant="standard"
            fullWidth
            sx={{
              bgcolor: INPUT_PASTEL_BEIGE,
              '& .MuiInputBase-root': { pl: 1 },
            }}
            value={firstDefinitionValue}
            required
            placeholder={`${t('addNewWord.definition', { ns: 'dashboard' })} *`}
            slotProps={{
              input: {
                disableUnderline: !isOpen,
                readOnly: readonly,
              },
            }}
            autoComplete="off"
            onChange={(e) => handleFirstDefinitionChange(e.target.value)}
          />
        ) : (
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
              onChange={(e) => handleWordLangDialectChange(Number(e.target.value))}
              inputProps={{ readOnly: readonly }}
            >
              {dialectOptions.map((option) => (
                <MenuItem key={option.id} value={option.id}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>

            <Select
              size="small"
              variant="standard"
              value={wordEntry.getSourceId()}
              sx={(theme) => ({
                flex: 1,
                fontSize: '0.875rem',
                color: theme.palette.text.secondary,
                width: '90%',
                maxWidth: 275,
              })}
              onChange={(e) => handleWordSourceChange(Number(e.target.value))}
              inputProps={{ readOnly: readonly }}
            >
              {sourceOptions.map((source) => (
                <MenuItem key={source.id} value={source.id}>
                  {source.label}
                </MenuItem>
              ))}
            </Select>
          </Box>
        )}

        {!readonly && (
          <IconButton
            size="small"
            onClick={handleDelete}
            sx={{ alignSelf: 'flex-end' }}
            color="error"
          >
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

          {visibleWordDetails.map((wd, i) => (
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
          <b>{stats.wordVariantsAmount}</b>
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {t('addNewWord.stats.definitionGroups', { ns: 'dashboard' }) + ': '}
          <b>{stats.wordDetailsAmount}</b>
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {t('addNewWord.stats.definitions', { ns: 'dashboard' }) + ': '}
          <b>{stats.definitionsAmount}</b>
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {t('addNewWord.stats.examples', { ns: 'dashboard' }) + ': '}
          <b>{stats.examplesAmount}</b>
        </Typography>
      </Box>
    </Box>
  );
};

export const WordEntry = React.memo(WordEntryComponent);
