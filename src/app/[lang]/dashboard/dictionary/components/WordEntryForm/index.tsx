'use client';

import React, { useCallback, useMemo, useRef, useState } from 'react';
import { Box, Typography, Select, MenuItem, Button, Grid, Snackbar, Alert } from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import AddIcon from '@mui/icons-material/Add';
import { useTranslation } from 'react-i18next';
import { WebsiteLang } from '@api/types.model';
import { SourcesCreatableSelect } from '../../../components/SearchableCreatableSelect';
import {
  WordModel,
  DictionaryProposalModel,
  SourceModel,
  SourceModelType,
  STATE,
} from '../../../models/proposal.model';
import { LangDialects } from '@repository/constants';
import { langDialectIdToString } from '../../../utils';
import { BUTTON_PASTEL_COLORS_BLUE, FORM_ENTRY_STATE, FormEntryStateType } from './constants';
import { WordEntry } from './WordEntry';

type AlertSeverity = 'error' | 'info' | 'success' | 'warning';

type EntryItem = {
  id: string;
  value: WordModel;
};

const createEntryId = (counterRef: React.MutableRefObject<number>) => {
  counterRef.current += 1;
  return `word-entry-${counterRef.current}`;
};

export const WordEntryForm: React.FC<{
  lang: WebsiteLang;
  sourceModels: SourceModelType[];
  formEntryState: FormEntryStateType;
  dictionaryModel?: DictionaryProposalModel;
}> = ({ lang, sourceModels, formEntryState, dictionaryModel }) => {
  const { t } = useTranslation(lang);

  const [alertMessage, setAlertMessage] = useState<
    { message: string; severity: AlertSeverity } | undefined
  >(undefined);

  const addEntryButtonRef = useRef<HTMLButtonElement>(null);
  const entryIdCounterRef = useRef(0);

  const [fromLangDialectId, setFromLangDialectId] = useState<number>(1);
  const [toLangDialectId, setToLangDialectId] = useState<number>(25);

  const [sources] = useState<SourceModel[]>(sourceModels.map((smt) => new SourceModel(smt)));

  const [selectedSource, setSelectedSource] = useState<SourceModel>(
    dictionaryModel ? dictionaryModel.source : sources[0],
  );

  const selectedSourceId = selectedSource.getId()!;

  const wordMeta = useMemo(
    () => ({
      langDialectId: fromLangDialectId,
      sourceId: selectedSourceId,
    }),
    [fromLangDialectId, selectedSourceId],
  );

  const defMeta = useMemo(
    () => ({
      langDialectId: toLangDialectId,
      sourceId: selectedSourceId,
    }),
    [toLangDialectId, selectedSourceId],
  );

  const [entryItems, setEntryItems] = useState<EntryItem[]>(() => {
    const initialEntries = dictionaryModel?.entries ?? [WordModel.createEmpty(wordMeta, defMeta)];

    return initialEntries.map((entry) => ({
      id: createEntryId(entryIdCounterRef),
      value: entry,
    }));
  });

  const dialectOptions = useMemo(
    () =>
      Object.entries(LangDialects).map(([id]) => ({
        id: Number(id),
        label: langDialectIdToString(Number(id), t),
      })),
    [t],
  );

  const entries = useMemo(() => entryItems.map((item) => item.value), [entryItems]);

  const addEntry = useCallback(() => {
    setEntryItems((prev) => [
      ...prev,
      {
        id: createEntryId(entryIdCounterRef),
        value: WordModel.createEmpty(wordMeta, defMeta),
      },
    ]);

    queueMicrotask(() => {
      addEntryButtonRef.current?.scrollIntoView({ block: 'start' });
    });
  }, [wordMeta, defMeta]);

  const updateEntry = useCallback((rowId: string, nextValue: WordModel) => {
    setEntryItems((prev) => {
      const idx = prev.findIndex((item) => item.id === rowId);
      if (idx === -1 || prev[idx].value === nextValue) {
        return prev;
      }

      const next = [...prev];
      next[idx] = { ...next[idx], value: nextValue };
      return next;
    });
  }, []);

  const deleteEntry = useCallback((rowId: string) => {
    setEntryItems((prev) => {
      const idx = prev.findIndex((entry) => entry.id === rowId);
      if (idx === -1) {
        return prev;
      }

      const item = prev[idx];
      const entry = item.value;

      if (!entry.isEmpty()) {
        const answer = window.confirm('Are you sure you want to delete this entry?');
        if (!answer) {
          return prev;
        }
      }

      // New unsaved row -> remove fully
      if (!entry.getId()) {
        if (prev.length <= 1) {
          return prev;
        }
        return prev.filter((entry) => entry.id !== rowId);
      }

      // Existing row -> keep it, just mark deleted
      const next = [...prev];
      entry.markDeleted();
      next[idx] = { ...item, value: entry };
      return next;
    });
  }, []);

  const handleSubmit = useCallback(async () => {
    const proposalEntries = entries.filter(
      (entry) => !entry.isEmpty() || entry.getState() === STATE.DELETED,
    );

    const proposalValue = new DictionaryProposalModel(
      proposalEntries,
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

    if (entries.some((entry) => entry.isIncomplete())) {
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
        return;
      }

      setAlertMessage({
        message: t('addNewWord.messages.savedSuccessfully', { ns: 'dashboard' }),
        severity: 'success',
      });
      window.location.reload();
    } catch (error) {
      console.error('Error saving proposal:', error);
      setAlertMessage({
        message: t('addNewWord.messages.failedToSave', { ns: 'dashboard' }),
        severity: 'error',
      });
    }
  }, [entries, selectedSource, fromLangDialectId, toLangDialectId, t]);

  return (
    <Box
      component="form"
      onSubmit={(e) => e.preventDefault()}
      sx={(theme) => ({
        maxWidth: 1200,
        [theme.breakpoints.down('md')]: { ml: 1.5 },
      })}
    >
      <Grid container columns={{ xs: 6 }} gap={1} mb={5}>
        <Grid size={{ xs: 6 }} display="flex" alignItems="center" gap={1}>
          <SourcesCreatableSelect
            label={t('addNewWord.source', { ns: 'dashboard' })}
            options={sources}
            value={selectedSource}
            lang={lang}
            onChange={setSelectedSource}
            readonly={formEntryState !== FORM_ENTRY_STATE.NEW}
            placeholder="Choose or add"
          />
        </Grid>

        <Grid size={{ xs: 6 }} display="flex" alignItems="center" gap={1}>
          <Select
            size="small"
            value={fromLangDialectId}
            sx={{ flex: 1 }}
            inputProps={{ readOnly: formEntryState !== FORM_ENTRY_STATE.NEW }}
            onChange={(e) => setFromLangDialectId(Number(e.target.value))}
          >
            {dialectOptions.map((option) => (
              <MenuItem key={option.id} value={option.id}>
                {option.label}
              </MenuItem>
            ))}
          </Select>

          <Typography>→</Typography>

          <Select
            size="small"
            value={toLangDialectId}
            sx={{ flex: 1 }}
            inputProps={{ readOnly: formEntryState !== FORM_ENTRY_STATE.NEW }}
            onChange={(e) => setToLangDialectId(Number(e.target.value))}
          >
            {dialectOptions.map((option) => (
              <MenuItem key={option.id} value={option.id}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
        </Grid>
      </Grid>

      {entryItems.map((item, idx) => (
        <WordEntry
          key={item.id}
          rowId={item.id}
          idx={idx + 1}
          wordEntry={item.value}
          onChange={updateEntry}
          onDelete={deleteEntry}
          lang={lang}
          defLangDialectId={toLangDialectId}
          defSourceId={selectedSourceId}
          allSources={sources}
          isFirst={idx === 0}
          isLast={idx === entryItems.length - 1}
          readonly={formEntryState === FORM_ENTRY_STATE.VIEW}
        />
      ))}

      {formEntryState === FORM_ENTRY_STATE.NEW && (
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

      <Box mt={2} mb={2}>
        {formEntryState !== FORM_ENTRY_STATE.VIEW && (
          <Button
            type="submit"
            variant="contained"
            size="small"
            startIcon={<SaveIcon />}
            onClick={handleSubmit}
            sx={{ mt: '4px', mb: 3 }}
          >
            {t('addNewWord.sendToReview', { ns: 'dashboard' })}
          </Button>
        )}
      </Box>

      <Snackbar
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        open={alertMessage !== undefined}
        autoHideDuration={6000}
        onClose={() => setAlertMessage(undefined)}
      >
        {alertMessage ? (
          <Alert severity={alertMessage.severity} variant="filled" sx={{ width: '100%' }}>
            {alertMessage.message}
          </Alert>
        ) : undefined}
      </Snackbar>
    </Box>
  );
};
