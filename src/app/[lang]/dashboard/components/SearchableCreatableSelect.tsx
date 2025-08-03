'use client';
import React, { useState } from 'react';
import {
  Autocomplete,
  TextField,
  createFilterOptions,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Stack,
  Typography,
} from '@mui/material';
import { SourceModel, STATE } from '../models/proposal.model';
import { WebsiteLang } from '@api/types.model';
import { useTranslation } from 'react-i18next';
import { capitalizeFirstLetter } from '@/search/definition/utils';

/**
 * The shape of a standard option.
 */
// export interface OptionType {
//   name: string;
//   authors: string;
//   /** present only on temporary “Add …” option */
//   inputValue?: string;
//   create?: boolean;
// }

export interface SourcesCreatableSelectProps {
  label?: string;
  options: SourceModel[];
  value: SourceModel;
  lang: WebsiteLang;
  onChange: (value: SourceModel) => void;
  /**
   * Called after the user fills in the dialog and saves.
   * Use this to persist the new option in your list.
   */
  onCreate?: (created: SourceModel) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

const filter = createFilterOptions<SourceModel>();

function isUserEnteringNewSource(source: SourceModel): boolean {
  return source.getState() === STATE.ADDED && source.getAuthors() === '';
}

/**
 * A select component with search + a dialog-based “create new” flow.
 */
export const SourcesCreatableSelect: React.FC<SourcesCreatableSelectProps> = ({
  label,
  options,
  value,
  lang,
  onChange,
  onCreate,
  placeholder,
  disabled = false,
  className = 'w-full',
}) => {
  const { t } = useTranslation(lang);
  const [inputValue, setInputValue] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);

  const [sourceName, setSourceName] = useState('');
  const [sourceAuthors, setSourceAuthors] = useState('');

  const handleDialogClose = () => {
    setDialogOpen(false);
    setSourceName('');
    setSourceAuthors('');
  };

  const handleSave = () => {
    const created: SourceModel = new SourceModel({
      state: STATE.ADDED,
      name: sourceName,
      authors: sourceAuthors,
    });
    // TODO: create source in DB and get result value with ID
    // TODO: then pass it down further below
    onCreate?.(created);
    onChange(created);
    handleDialogClose();
  };

  return (
    <>
      <Autocomplete
        className={className}
        sx={{ minWidth: '150px', flex: 1 }}
        size="small"
        disabled={disabled}
        value={value}
        onChange={(event, newValue) => {
          if (newValue) {
            const newSource = newValue as SourceModel;
            if (isUserEnteringNewSource(newSource)) {
              // User clicked “Add …” → open dialog.
              setSourceName(newSource.getName() ?? '');
              setDialogOpen(true);
              return;
            }
            onChange(newValue);
          }
        }}
        inputValue={inputValue}
        onInputChange={(_, newInputValue) => setInputValue(newInputValue)}
        filterOptions={(opts, params) => {
          const filtered = filter(opts, params);
          const { inputValue } = params;
          const isExisting = opts.some(
            (o) => o.getName().toLowerCase() === inputValue.toLowerCase(),
          );
          if (inputValue !== '' && !isExisting && onCreate) {
            filtered.push(
              new SourceModel({
                state: STATE.ADDED,
                name: inputValue,
                authors: '',
              }),
            );
          }
          return filtered;
        }}
        options={options}
        getOptionLabel={(option) => `${option.getName()} — ${option.getAuthors()}`}
        renderOption={(props, option) => (
          <li
            {...props}
            key={option.getName() ?? `${option.getName()}_${option.getAuthors()}`}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}
          >
            {isUserEnteringNewSource(option)
              ? `${capitalizeFirstLetter(t('addNewWord.add', { ns: 'dashboard' }))} "${option.getName()}"`
              : option.getName()}
            <Typography
              key={option.getAuthors()}
              variant="caption"
              ml={1}
              sx={{ minWidth: 'fit-content', alignSelf: 'flex-end' }}
            >
              {option.getAuthors()}
            </Typography>
          </li>
        )}
        renderInput={(params) => (
          <TextField {...params} variant="outlined" label={label} placeholder={placeholder} />
        )}
      />

      {/* Dialog for creating a new option */}
      <Dialog open={dialogOpen} onClose={handleDialogClose} fullWidth>
        <DialogTitle>{t('addNewWord.addNewSource', { ns: 'dashboard' })}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label={t('addNewWord.sourceName', { ns: 'dashboard' })}
              value={sourceName}
              onChange={(e) => setSourceName(e.target.value)}
              fullWidth
              autoFocus
            />
            <TextField
              label={t('addNewWord.authors', { ns: 'dashboard' })}
              value={sourceAuthors}
              onChange={(e) => setSourceAuthors(e.target.value)}
              fullWidth
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose}>{t('addNewWord.cancel', { ns: 'dashboard' })}</Button>
          <Button onClick={handleSave} variant="contained" disabled={sourceName.trim() === ''}>
            {t('addNewWord.save', { ns: 'dashboard' })}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};
