import {
  WordDetailModel,
  SourceModel,
  WordDetailModelType,
  DefinitionModel,
  TranslationModel,
} from '@/dashboard/models/proposal.model';
import { langDialectIdToString } from '@/dashboard/utils';
import { flipAndMergeTags, capitalizeFirstLetter } from '@/search/definition/utils';
import { WebsiteLang } from '@api/types.model';
import {
  Box,
  Snackbar,
  Alert,
  Select,
  MenuItem,
  IconButton,
  Stack,
  Chip,
  TextField,
  Divider,
  Typography,
  Button,
  Menu,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { LangDialects } from '@repository/constants';
import React from 'react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { BUTTON_PASTEL_COLORS_BLUE } from './constants';
import { DefinitionBlock } from './DefinitionBlock';
import { ExampleLine } from './ExampleLine';
import { TagSelector } from './TagSelector';

/* ---------------- WordDetailBlock ---------------- */
export const WordDetailBlock: React.FC<{
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
