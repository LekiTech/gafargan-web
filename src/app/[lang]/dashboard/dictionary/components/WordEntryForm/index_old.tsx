'use client';
import React, { useReducer, useRef, useState } from 'react';
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
} from '../../../models/proposal.model';
import { LangDialects } from '@repository/constants';
import { langDialectIdToString } from '../../../utils';
import { BUTTON_PASTEL_COLORS_BLUE, FORM_ENTRY_STATE, FormEntryStateType } from './constants';
import { WordEntry } from './WordEntry';

/* ---------------- Root component ---------------- */
export const WordEntryForm: React.FC<{
  lang: WebsiteLang;
  sourceModels: SourceModelType[];
  formEntryState: FormEntryStateType;
  dictionaryModel?: DictionaryProposalModel;
}> = ({ lang, sourceModels, formEntryState, dictionaryModel }) => {
  const { t } = useTranslation(lang);

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
            readonly={formEntryState !== FORM_ENTRY_STATE.NEW}
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
            inputProps={{ readOnly: formEntryState !== FORM_ENTRY_STATE.NEW }}
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
            inputProps={{ readOnly: formEntryState !== FORM_ENTRY_STATE.NEW }}
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
      {/* live json */}
      <Box mt={2} mb={2}>
        {formEntryState !== FORM_ENTRY_STATE.VIEW && (
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
