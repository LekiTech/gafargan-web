import { WordModel, SpellingVariantModel, SourceModel } from '@/dashboard/models/proposal.model';
import { langDialectIdToString } from '@/dashboard/utils';
import { expressionFont } from '@/fonts';
import { IdToLang, LangToId } from '@api/languages';
import { WebsiteLang } from '@api/types.model';
import { Box, Chip, TextField, Select, MenuItem, IconButton } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import { LangDialects } from '@repository/constants';
import { useTranslation } from 'react-i18next';
import { BUTTON_PASTEL_COLORS_BLUE } from './constants';

/* ------------- SpellingVariants -------------- */
export const SpellingVariants: React.FC<{
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
