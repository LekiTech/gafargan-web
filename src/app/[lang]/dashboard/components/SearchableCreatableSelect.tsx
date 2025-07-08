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

/**
 * The shape of a standard option.
 */
export interface OptionType {
  name: string;
  authors: string;
  /** present only on temporary “Add …” option */
  inputValue?: string;
  create?: boolean;
}

export interface SourcesCreatableSelectProps {
  label?: string;
  options: OptionType[];
  value: OptionType | null;
  onChange: (value: OptionType | null) => void;
  /**
   * Called after the user fills in the dialog and saves.
   * Use this to persist the new option in your list.
   */
  onCreate?: (created: OptionType) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

const filter = createFilterOptions<OptionType>();

/**
 * A select component with search + a dialog-based “create new” flow.
 */
export const SourcesCreatableSelect: React.FC<SourcesCreatableSelectProps> = ({
  label,
  options,
  value,
  onChange,
  onCreate,
  placeholder,
  disabled = false,
  className = 'w-full',
}) => {
  const [inputValue, setInputValue] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);

  const [draftLabel, setDraftLabel] = useState('');
  const [draftDescription, setDraftDescription] = useState('');

  const handleDialogClose = () => {
    setDialogOpen(false);
    setDraftLabel('');
    setDraftDescription('');
  };

  const handleSave = () => {
    const created: OptionType = {
      name: draftLabel,
      authors: draftDescription,
    };
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
          if (newValue && (newValue as OptionType).create) {
            // User clicked “Add …” → open dialog.
            setDraftLabel((newValue as OptionType).inputValue ?? '');
            setDialogOpen(true);
            return;
          }
          onChange(newValue);
        }}
        inputValue={inputValue}
        onInputChange={(_, newInputValue) => setInputValue(newInputValue)}
        filterOptions={(opts, params) => {
          const filtered = filter(opts, params);
          const { inputValue } = params;
          const isExisting = opts.some((o) => o.name.toLowerCase() === inputValue.toLowerCase());
          if (inputValue !== '' && !isExisting) {
            filtered.push({
              name: `Add "${inputValue}"`,
              authors: '',

              inputValue,
              create: true,
            });
          }
          return filtered;
        }}
        options={options}
        getOptionLabel={(option) => `${option.name} — ${option.authors}`}
        renderOption={(props, option) => (
          <li
            {...props}
            key={option.inputValue ?? `${option.name}_${option.authors}`}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}
          >
            {option.name}
            <Typography
              key={option.authors}
              variant="caption"
              ml={1}
              sx={{ minWidth: 'fit-content', alignSelf: 'flex-end' }}
            >
              {option.authors}
            </Typography>
          </li>
        )}
        renderInput={(params) => (
          <TextField {...params} variant="outlined" label={label} placeholder={placeholder} />
        )}
      />

      {/* Dialog for creating a new option */}
      <Dialog open={dialogOpen} onClose={handleDialogClose} fullWidth>
        <DialogTitle>Add new option</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Label"
              value={draftLabel}
              onChange={(e) => setDraftLabel(e.target.value)}
              fullWidth
              autoFocus
            />
            <TextField
              label="Description (optional)"
              value={draftDescription}
              onChange={(e) => setDraftDescription(e.target.value)}
              fullWidth
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose}>Cancel</Button>
          <Button onClick={handleSave} variant="contained" disabled={draftLabel.trim() === ''}>
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};
