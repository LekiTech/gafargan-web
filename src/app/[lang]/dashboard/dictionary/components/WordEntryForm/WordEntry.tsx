/* ---------------- Entry ---------------- */
// TODO: optimize by adding custom `arePropsEqual` function to memo

import {
  WordModel,
  SourceModel,
  SpellingVariantModel,
  WordDetailModel,
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
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { INPUT_PASTEL_BEIGE, BUTTON_PASTEL_COLORS_BLUE } from './constants';
import { SpellingVariants } from './SpellingVariants';
import { WordDetailBlock } from './WordDetailBlock';

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
